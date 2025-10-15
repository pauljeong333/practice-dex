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
import { BufferMemory } from "langchain/memory";
import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { getMessageHistory } from "../utils/getChatHistory";

const USERS_TABLE = process.env.USERS_TABLE!;
const SESSIONS_TABLE = process.env.SESSIONS_TABLE!;
const OPENAI_KEY_PARAM_NAME = process.env.OPENAI_KEY_PARAM_NAME!;
const LANGCHAIN_KEY_PARAM_NAME = process.env.LANGCHAIN_KEY_PARAM_NAME!;

const dynamo = new DynamoDBClient({});
const ssm = new SSMClient({});

const generateGoalId = (text: string): string =>
  crypto.createHash("sha1").update(text).digest("hex").slice(0, 8);

async function getSSMParameter(name: string): Promise<string> {
  const res = await ssm.send(
    new GetParameterCommand({ Name: name, WithDecryption: true })
  );
  if (!res.Parameter?.Value) throw new Error(`Missing SSM param: ${name}`);
  return res.Parameter.Value;
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
  newChat?: boolean;
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

// --- Lambda ---
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
    const { uid, instrument, userMessage, sessionUpdated, newChat } = body;

    if (!uid || !instrument || !userMessage) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          error: "uid, instrument, and userMessage are required",
        }),
      };
    }

    if (!process.env.OPENAI_API_KEY)
      process.env.OPENAI_API_KEY = await getSSMParameter(OPENAI_KEY_PARAM_NAME);

    if (!process.env.LANGCHAIN_API_KEY)
      process.env.LANGCHAIN_API_KEY = await getSSMParameter(
        LANGCHAIN_KEY_PARAM_NAME
      );

    process.env.LANGCHAIN_TRACING_V2 = "true";
    process.env.LANGCHAIN_PROJECT = "PracticeDex";

    if (sessionUpdated) invalidateCache(uid, instrument);

    // --- Fetch user ---
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

    // --- Fetch sessions ---
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

    // --- Goal lookup ---
    const goalLookup: Record<string, string> = {};
    pastSessions.forEach((s) => {
      s.goals?.forEach((g) => {
        if (g.text) goalLookup[g.text] = g.id || generateGoalId(g.text);
      });
    });

    // --- Resolve chatId & memory via helper ---
    const { messageHistory, chatId } = await getMessageHistory(
      uid,
      instrument,
      newChat
    );

    const memory = new BufferMemory({
      chatHistory: messageHistory,
      returnMessages: true,
      memoryKey: "history",
    });

    // --- LLM setup ---
    const llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      modelName: "gpt-4.1-mini",
      temperature: 0.7,
    });

    const memoryVars = await memory.loadMemoryVariables({});

    const prompt = ChatPromptTemplate.fromTemplate(`
      You are an empathetic and expert AI music coach. 
      You know the user's instrument ({instrument}) and preferences ({preferences}). 
      You also have access to their previous practice sessions.

      Past sessions: {pastSessions}
      Past goals: {pastGoals}
      Conversation so far: {history}

      User said: "{userMessage}"

      Respond conversationally as a coach.
      Return only:
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
      history: memoryVars.history || "",
    });

    const result = await llm.invoke(formattedPrompt);
    const content = (result as any)?.content;
    let parsed: ChatResponse;

    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { response: content || "Sorry, I didn’t understand that." };
    }

    if (parsed.action?.session?.goals) {
      parsed.action.session.goals = parsed.action.session.goals.map((g) => ({
        id: goalLookup[g.text] || generateGoalId(g.text),
        text: g.text,
      }));
    }

    await messageHistory.addUserMessage(userMessage);
    await messageHistory.addAIMessage(parsed.response);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ chatId, ...parsed }),
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
