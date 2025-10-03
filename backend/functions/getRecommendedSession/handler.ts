import {
  DynamoDBClient,
  QueryCommand,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { OpenAI } from "openai";
import * as crypto from "crypto";

const dynamo = new DynamoDBClient({});
const ssm = new SSMClient({});

const USERS_TABLE = process.env.USERS_TABLE!;
const SESSIONS_TABLE = process.env.SESSIONS_TABLE!;
const OPENAI_KEY_PARAM_NAME = process.env.OPENAI_KEY_PARAM_NAME!;

// Helper to generate 8-digit SHA1-based goal id
const generateGoalId = (text: string) => {
  return crypto.createHash("sha1").update(text).digest("hex").slice(0, 8);
};

async function getOpenAIKey(): Promise<string> {
  const command = new GetParameterCommand({
    Name: OPENAI_KEY_PARAM_NAME,
    WithDecryption: true,
  });

  const response = await ssm.send(command);

  if (!response.Parameter?.Value) {
    throw new Error("OpenAI key not found in SSM");
  }

  return response.Parameter.Value;
}

export const handler = async (event: any) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
  };

  try {
    const body = JSON.parse(event.body);
    const { uid, instrument } = body;

    if (!uid || !instrument) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "uid and instrument required" }),
      };
    }

    // 1. Get user info
    const userRes = await dynamo.send(
      new GetItemCommand({
        TableName: USERS_TABLE,
        Key: marshall({ uid }),
      })
    );
    if (!userRes.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "User not found" }),
      };
    }
    const user = unmarshall(userRes.Item);

    // 2. Get past sessions for this instrument
    const sessionsRes = await dynamo.send(
      new QueryCommand({
        TableName: SESSIONS_TABLE,
        IndexName: "UidDateCreatedIndex",
        KeyConditionExpression: "uid = :uid",
        ExpressionAttributeValues: marshall({ ":uid": uid }),
      })
    );

    const pastSessions = (sessionsRes.Items || [])
      .map((i) => unmarshall(i))
      .filter((s) => s.instrument === instrument);

    // 3. Build goal lookup map from past sessions
    const goalLookup: Record<string, string> = {};
    pastSessions.forEach((s: any) => {
      s.goals?.forEach((g: any) => {
        if (g.text) {
          goalLookup[g.text] = g.id || generateGoalId(g.text);
        }
      });
    });

    // Fetch OpenAI key from SSM
    const openaiKey = await getOpenAIKey();
    const openai = new OpenAI({ apiKey: openaiKey });

    // 4. Prepare prompt for OpenAI
    const systemPrompt = `
      You are an expert AI musician practice coach with deep knowledge of music theory, technique, and pedagogy. 
      Generate a recommended music practice session for a user. Goals must be realistic, practical, achievable, and musically accurate, using proper musical terminology.

      Return ONLY a single JSON object with fields:
      - title: string
      - totalDuration: integer (seconds)
      - goals: array of { id: string, text: string }

      Instructions:
      - Use the user's past sessions, preferences, and skill level (beginner, intermediate, advanced).
      - If the user has no past sessions or preferences, create general but useful practice goals as you see fit.
      - Adapt goals to the user's skill level: provide exercises, repertoire, and techniques that are achievable yet challenging.
      - Preserve IDs for repeated goals (match by goal text in pastGoals).
      - For new goals, generate a new 8-digit hexadecimal id.
      - Respect the user's preferredSessionLength if provided when calculating totalDuration.
      - Ensure goals are actionable, specific, and use musical terms (e.g., scales, arpeggios, sight-reading, dynamics, articulation, phrasing, rhythm, technique exercises, repertoire work, improvisation).
      - Balance technical exercises, musicality, and repertoire practice for a single session.
      - Do not include explanations, comments, or text outside the JSON object.
    `;

    const userPrompt = `
      User info: ${JSON.stringify({
        streak: user?.streak,
        preferences: user?.preferences || {},
      })}
      Instrument: ${instrument}
      PastGoals: ${JSON.stringify(goalLookup)}
      PastSessions: ${JSON.stringify(
        pastSessions.map((s) => ({
          title: s.title,
          totalDuration: s.totalDuration,
          goals: s.goals?.map((g: any) => ({ id: g.id, text: g.text })),
        }))
      )}
      Generate a recommended music practice session.
    `;

    console.log("User Prompt:", userPrompt);

    // 5. Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0].message?.content || "{}";
    const recommendedSession = JSON.parse(responseText);

    // 6. Ensure goal ids are correct
    recommendedSession.goals = recommendedSession.goals.map((g: any) => ({
      id: goalLookup[g.text] || generateGoalId(g.text),
      text: g.text,
    }));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(recommendedSession),
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
