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

    const {
      uid,
      title,
      instrument,
      goals,
      totalDuration,
      currentDuration,
      scheduledFor,
      status,
    } = JSON.parse(event.body);

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
      session_id: sessionId,
      uid,
      title,
      instrument,
      goals: goals || [],
      totalDuration,
      currentDuration,
      scheduledFor,
      status,
      uid_status: uid + "#scheduled",
      dateCreated,
    };

    console.log("Item before marshalling:", item);

    const undefinedKeys = Object.keys(item).filter(
      (key) => item[key] === undefined
    );
    if (undefinedKeys.length > 0) {
      console.warn("Undefined keys:", undefinedKeys);
    }

    await client.send(
      new PutItemCommand({
        TableName: SESSIONS_TABLE,
        Item: marshall(item),
      })
    );

    return {
      statusCode: 201,
      headers,
      body: JSON.stringify({
        message: "Scheduled session created",
      }),
    };
  } catch (error: any) {
    console.error("Error creating scheduled session:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to create scheduled session" }),
    };
  }
};
