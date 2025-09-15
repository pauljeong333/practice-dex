import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
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
    await verifyUser(event);

    const { sessionId } = JSON.parse(event.body);
    if (!sessionId) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "sessionId is required" }),
      };
    }

    // Get session by sessionId
    const result = await client.send(
      new GetItemCommand({
        TableName: SESSIONS_TABLE,
        Key: { session_id: { S: sessionId } },
      })
    );

    if (!result.Item) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: "Session not found" }),
      };
    }

    const session = unmarshall(result.Item);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ session }),
    };
  } catch (error: any) {
    console.error("Error retrieving session:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to retrieve session" }),
    };
  }
};
