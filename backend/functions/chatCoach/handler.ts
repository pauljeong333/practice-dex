import {
  DynamoDBClient,
  QueryCommand,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import * as crypto from "crypto";
import { ChatOpenAI } from "@langchain/openai";
import { RunnableSequence } from "@langchain/core/runnables";
import { PromptTemplate } from "@langchain/core/prompts";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

// --- Environment Variables ---
const USERS_TABLE = process.env.USERS_TABLE!;
const SESSIONS_TABLE = process.env.SESSIONS_TABLE!;
const OPENAI_KEY_PARAM_NAME = process.env.OPENAI_KEY_PARAM_NAME!;

// --- AWS Clients ---
const dynamo = new DynamoDBClient({});
const ssm = new SSMClient({});

// --- Helper: generate 8-digit SHA1-based goal id ---
const generateGoalId = (text: string): string =>
  crypto.createHash("sha1").update(text).digest("hex").slice(0, 8);

// --- Helper: get OpenAI key from SSM ---
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

// --- TTL Cache Setup ---
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}
const TTL_MS = 5 * 60 * 1000; // 5 minutes
const userCache = new Map<string, CacheEntry<User>>();
const sessionCache = new Map<string, CacheEntry<Session[]>>();

function getFromCache<T>(
  cache: Map<string, CacheEntry<T>>,
  key: string
): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return undefined;
  }
  return entry.value;
}

function setCache<T>(cache: Map<string, CacheEntry<T>>, key: string, value: T) {
  cache.set(key, { value, expiresAt: Date.now() + TTL_MS });
}

// --- Helper: invalidate cache for a user/instrument ---
function invalidateCache(uid: string, instrument?: string) {
  userCache.delete(uid);
  if (instrument) {
    sessionCache.delete(`${uid}-${instrument}`);
  } else {
    // Remove all sessions for this user
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
  // Optional: flag to indicate if a new session was created/completed
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

    // --- Invalidate cache if a session was updated ---
    if (sessionUpdated) {
      invalidateCache(uid, instrument);
    }

    // --- 1️⃣ Fetch user info (with cache) ---
    let user = getFromCache(userCache, uid);
    if (!user) {
      const userRes = await dynamo.send(
        new GetItemCommand({ TableName: USERS_TABLE, Key: marshall({ uid }) })
      );
      if (!userRes.Item) {
        return {
          statusCode: 404,
          headers,
          body: JSON.stringify({ error: "User not found" }),
        };
      }
      user = unmarshall(userRes.Item) as User;
      setCache(userCache, uid, user);
    }

    // --- 2️⃣ Fetch past sessions (with cache) ---
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

    // --- 4️⃣ Setup LangChain ---
    const apiKey = await getOpenAIKey();
    const llm = new ChatOpenAI({
      apiKey,
      modelName: "gpt-4.1-mini",
      temperature: 0.7,
    });

    const prompt = PromptTemplate.fromTemplate(`
      You are an empathetic and expert AI music coach.
      You know the user's instrument ({instrument}), streak ({streak}), and preferences ({preferences}).
      You also have access to their previous practice sessions.

      PastSessions: {pastSessions}
      PastGoals: {pastGoals}

      The user just said: "{userMessage}"

      Your goal:
      1. Respond conversationally as a coach.
      2. If the user wants to start or schedule a session, include an action object with a session:
         - title: string
         - totalDuration: integer (seconds)
         - goals: array of { id: string, text: string }

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

    const chain = RunnableSequence.from([prompt, llm]);

    // --- 5️⃣ Run chain ---
    const result = await chain.invoke({
      instrument,
      streak: user.streak ?? 0,
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

    // --- 6️⃣ Parse response safely ---
    let parsed: ChatResponse;
    const contentStr =
      typeof result.content === "string"
        ? result.content
        : Array.isArray(result.content)
        ? result.content
            .map((c: any) => ("text" in c ? c.text : JSON.stringify(c)))
            .join(" ")
        : JSON.stringify(result.content);

    try {
      parsed = JSON.parse(contentStr) as ChatResponse;
    } catch {
      parsed = { response: contentStr };
    }

    // --- 7️⃣ Ensure goal ids in action.session ---
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
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error", details: err }),
    };
  }
};
