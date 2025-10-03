import {
  DynamoDBClient,
  QueryCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { APIGatewayProxyHandler } from "aws-lambda";
import { updatePreferences } from "../utils/updatePreferences";
import { updateStreak } from "../utils/updateStreak";

interface Goal {
  id: string;
  text: string;
  completed: boolean;
  timeSpent?: number;
  performanceScore?: number | null;
}

interface Preferences {
  preferredSessionLength?: number;
  favoriteGoals?: { id: string; text: string; totalTimeSpent: number }[];
  preferredTimes?: string[];
}

export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  streak: number;
  preferences: Preferences;
  dateCreated: string | null;
  isNewUser: boolean;
  activeSession: string | null;
  lastUpdated: string;
}

export interface Session {
  session_id: string;
  uid: string;
  title: string;
  instrument: string;
  goals: Goal[];
  totalDuration: number;
  currentDuration: number;
  durationMinutes: number;
  status: string;
  stars: number;
  notes: string | null;
  dateCreated: string;
  dateCompleted: string | null;
  completedOn: string | null;
}

const client = new DynamoDBClient({});
const USERS_TABLE = process.env.USERS_TABLE || "Users";
const SESSIONS_TABLE = process.env.SESSIONS_TABLE || "Sessions";

export const handler: APIGatewayProxyHandler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
  };

  try {
    const body = JSON.parse(event.body || "{}");
    const { uid, newSession, userTimezone } = body;

    if (!uid || !newSession) {
      return {
        statusCode: 400,
        headers: headers,
        body: JSON.stringify({ error: "Missing uid or newSession" }),
      };
    }

    // --- 1. Fetch completed sessions from the GSI
    const sessionsResult = await client.send(
      new QueryCommand({
        TableName: SESSIONS_TABLE,
        IndexName: "UidStatusDateCreatedIndex",
        KeyConditionExpression: "uid_status = :uid_status",
        ExpressionAttributeValues: {
          ":uid_status": { S: `${uid}#completed` },
        },
        ScanIndexForward: false, // newest first
      })
    );

    const completedSessions: Session[] = (sessionsResult.Items || []).map(
      (item) => {
        return {
          session_id: item.session_id.S!,
          uid: item.uid.S!,
          title: item.title.S!,
          instrument: item.instrument.S!,
          goals: JSON.parse(item.goals.S || "[]"),
          totalDuration: Number(item.totalDuration?.N || 0),
          currentDuration: Number(item.currentDuration?.N || 0),
          durationMinutes: Number(item.durationMinutes?.N || 0),
          status: item.status.S!,
          stars: Number(item.stars?.N || 0),
          notes: item.notes?.S || null,
          dateCreated: item.dateCreated.S!,
          dateCompleted: item.dateCompleted?.S || null,
          completedOn: item.completedOn?.S || null,
        };
      }
    );

    // Include the just-finished session in-memory
    const allSessions = [...completedSessions, newSession];

    // --- 2. Fetch the user record
    const userResult = await client.send(
      new QueryCommand({
        TableName: USERS_TABLE,
        KeyConditionExpression: "uid = :uid",
        ExpressionAttributeValues: { ":uid": { S: uid } },
      })
    );

    if (!userResult.Items || userResult.Items.length === 0) {
      return {
        statusCode: 404,
        headers: headers,
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    const userItem = userResult.Items[0];

    const user: User = {
      uid: userItem.uid?.S || "",
      email: userItem.email?.S || "",
      displayName: userItem.displayName?.S || null,
      streak: Number(userItem.streak?.N || 0),
      preferences: JSON.parse(userItem.preferences?.S || "{}"),
      dateCreated: userItem.dateCreated?.S || null,
      isNewUser: userItem.isNewUser?.BOOL || false,
      activeSession: userItem.activeSession?.S || null,
      lastUpdated: userItem.lastUpdated?.S || new Date().toISOString(),
    };

    // --- 3. Update preferences
    const newPreferences = updatePreferences(
      user.preferences,
      allSessions,
      userTimezone
    );

    // --- 4. Update streak
    const today = new Date(newSession.dateCreated);
    const newStreak = updateStreak(user.streak, user.lastUpdated, today);

    // --- 5. Update user in DynamoDB
    await client.send(
      new UpdateItemCommand({
        TableName: USERS_TABLE,
        Key: { uid: { S: uid } },
        UpdateExpression:
          "SET preferences = :preferences, streak = :streak, lastUpdated = :lastUpdated",
        ExpressionAttributeValues: {
          ":preferences": { S: JSON.stringify(newPreferences) },
          ":streak": { N: newStreak.toString() },
          ":lastUpdated": { S: newSession.dateCreated },
        },
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        user: {
          ...user,
          preferences: newPreferences,
          streak: newStreak,
          lastUpdated: newSession.dateCreated,
        },
      }),
    };
  } catch (error) {
    console.error("Error updating user:", error);
    return {
      headers,
      statusCode: 500,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
