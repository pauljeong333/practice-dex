import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";
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

    const { sessionId, session } = JSON.parse(event.body);

    if (!sessionId || !session) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing sessionId or session object" }),
      };
    }

    // Ensure user owns this session
    if (session.uid !== authUid) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: "UID in session doesn't match token" }),
      };
    }

    // Overwrite the existing session (full replace)
    const item = {
      session_id: sessionId,
      ...session,
    };

    await client.send(
      new PutItemCommand({
        TableName: SESSIONS_TABLE,
        Item: marshall(item, { removeUndefinedValues: true }),
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "Session updated successfully",
        session: item,
      }),
    };
  } catch (error: any) {
    console.error("Error updating session:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to update session" }),
    };
  }
};
