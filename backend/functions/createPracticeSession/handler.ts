import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { verifyUser } from "../utils/auth";

const client = new DynamoDBClient({});
const SESSIONS_TABLE = process.env.SESSIONS_TABLE!;

export const handler = async (event: any) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
  };

  try {
    // Verify Firebase token
    const decodedToken = await verifyUser(event);
    const authUid = decodedToken.uid;

    const { uid, instrument, goals, duration, status, endTime } = JSON.parse(
      event.body
    );

    if (uid !== authUid) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: "UID in body doesn't match token" }),
      };
    }

    const dateCreated = new Date().toISOString();
    const sessionId = uuidv4();

    const item = {
      sessionId,
      uid,
      instrument,
      goals,
      duration,
      status,
      endTime,
      dateCreated,
    };

    await client.send(
      new PutItemCommand({
        TableName: SESSIONS_TABLE,
        Item: marshall(item),
      })
    );

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({ message: "Session created", sessionId }),
    };
  } catch (error: any) {
    console.error("Error creating session:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to create session" }),
    };
  }
};
