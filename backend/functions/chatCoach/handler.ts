import {
  DynamoDBClient,
  QueryCommand,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import * as crypto from "crypto";
import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

const USERS_TABLE = process.env.USERS_TABLE!;
const SESSIONS_TABLE = process.env.SESSIONS_TABLE!;
const OPENAI_KEY_PARAM_NAME = process.env.OPENAI_KEY_PARAM_NAME!;

const dynamo = new DynamoDBClient({});
const ssm = new SSMClient({});

// --- Helper: generate short hash id for goals ---
const generateGoalId = (text: string): string =>
  crypto.createHash("sha1").update(text).digest("hex").slice(0, 8);

async function getOpenAIKey(): Promise<string> {
  const command = new GetParameterCommand({
    Name: OPENAI_KEY_PARAM_NAME,
    WithDecryption: true,
  });
  const response = await ssm.send(command);
  if (!response.Parameter?.Value)
    throw new Error("OpenAI key not found in SSM");
  return response.Parameter.Value;
}

// --- TTL Cache ---
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}
const TTL_MS = 5 * 60 * 1000;
const userCache = new Map<string, CacheEntry<User>>();
const sessionCache = new Map<string, CacheEntry<Session[]>>();

function getFromCache<T>(
  cache: Map<string, CacheEntry<T>>,
  key: string
): T | undefined {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}
function setCache<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T) {
  cache.set(key, { value, expiresAt: Date.now() + TTL_MS });
}
function invalidateCache(uid: string, instrument?: string) {
  userCache.delete(uid);
  if (instrument) {
    sessionCache.delete(`${uid}-${instrument}`);
  } else {
    for (const key of sessionCache.keys()) {
      if (key.startsWith(`${uid}-`)) sessionCache.delete(key);
    }
  }
}

// --- Types ---
interface User {
  uid: string;
  streak?: number;
  preferences?: Record<string, any>;
}

interface Session {
  instrument: string;
  title: string;
  totalDuration: number;
  goals?: { id: string; text: string }[];
}

interface ChatRequestBody {
  uid: string;
  instrument: string;
  userMessage: string;
  sessionUpdated?: boolean;
}

interface ChatAction {
  type: "scheduleSession" | "startSession";
  session: {
    title: string;
    totalDuration: number;
    goals: { id: string; text: string }[];
  };
}

interface ChatResponse {
  response: string;
  action?: ChatAction;
}

// --- Lambda Handler ---
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
  };

  try {
    if (!event.body)
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing request body" }),
      };

    const body: ChatRequestBody = JSON.parse(event.body);
    const { uid, instrument, userMessage, sessionUpdated } = body;

    if (!uid || !instrument || !userMessage) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "uid, instrument, and userMessage are required",
        }),
      };
    }

    if (sessionUpdated) invalidateCache(uid, instrument);

    // --- 1️⃣ Fetch user ---
    let user = getFromCache(userCache, uid);
    if (!user) {
      const userRes = await dynamo.send(
        new GetItemCommand({ TableName: USERS_TABLE, Key: marshall({ uid }) })
      );
      if (!userRes.Item)
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: "User not found" }),
        };
      user = unmarshall(userRes.Item) as User;
      setCache(userCache, uid, user);
    }

    // --- 2️⃣ Fetch sessions ---
    const sessionKey = `${uid}-${instrument}`;
    let pastSessions = getFromCache(sessionCache, sessionKey);
    if (!pastSessions) {
      const sessionsRes = await dynamo.send(
        new QueryCommand({
          TableName: SESSIONS_TABLE,
          IndexName: "UidDateCreatedIndex",
          KeyConditionExpression: "uid = :uid",
          ExpressionAttributeValues: marshall({ ":uid": uid }),
        })
      );
      pastSessions = (sessionsRes.Items || [])
        .map((i) => unmarshall(i) as Session)
        .filter((s) => s.instrument === instrument);
      setCache(sessionCache, sessionKey, pastSessions);
    }

    // --- 3️⃣ Build goal lookup ---
    const goalLookup: Record<string, string> = {};
    pastSessions.forEach((s) => {
      s.goals?.forEach((g) => {
        if (g.text) goalLookup[g.text] = g.id || generateGoalId(g.text);
      });
    });

    // --- 4️⃣ LLM setup ---
    const apiKey = await getOpenAIKey();
    const llm = new ChatOpenAI({
      apiKey,
      modelName: "gpt-4.1-mini",
      temperature: 0.7,
    });

    const prompt = ChatPromptTemplate.fromTemplate(`
      You are an empathetic and expert AI music coach.
      You know the user's instrument ({instrument}) and preferences ({preferences}).
      You also have access to their previous practice sessions.

      PastSessions: {pastSessions}
      PastGoals: {pastGoals}

      The user just said: "{userMessage}"

      Your goal:
      1. Respond conversationally as a coach.
      2. If the user wants to start or schedule a session, include an action object with a session:
         - title: string
         - totalDuration: integer (seconds)
         - goals: array of {{ id: string, text: string }}

         Use this exact JSON format:
         {{
           "response": "your conversational reply",
           "action": {{
             "type": "scheduleSession" or "startSession",
             "session": {{
               "title": "session title",
               "totalDuration": 1800,
               "goals": [{{ "id": "abcd1234", "text": "goal text" }}]
             }}
           }}
         }}

      Otherwise, return only:
         {{ "response": "your reply" }}
    `);

    const formattedPrompt = await prompt.format({
      instrument,
      preferences: JSON.stringify(user.preferences || {}),
      pastSessions: JSON.stringify(
        pastSessions.map((s) => ({
          title: s.title,
          totalDuration: s.totalDuration,
          goals: s.goals?.map((g) => ({ id: g.id, text: g.text })),
        }))
      ),
      pastGoals: JSON.stringify(goalLookup),
      userMessage,
    });

    // --- 5️⃣ Call LLM ---
    const result = await llm.invoke(formattedPrompt);

    // --- 6️⃣ Parse result properly ---
    const content = (result as any)?.content;
    let parsed: ChatResponse;

    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { response: content || "Sorry, I didn’t understand that." };
    }

    // --- 7️⃣ Ensure valid goal ids ---
    if (parsed.action?.session?.goals) {
      parsed.action.session.goals = parsed.action.session.goals.map((g) => ({
        id: goalLookup[g.text] || generateGoalId(g.text),
        text: g.text,
      }));
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(parsed),
    };
  } catch (err: any) {
    console.error("Lambda Error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: "Internal server error",
        details: err.message || err,
      }),
    };
  }
};
