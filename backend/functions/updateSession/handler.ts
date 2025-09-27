import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
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
    const decodedToken = await verifyUser(event);

    const { sessionId, session } = JSON.parse(event.body);

    if (!sessionId || !session) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing sessionId or session object" }),
      };
    }

    // Build update expression dynamically
    const updateExp: string[] = [];
    const expAttrValues: Record<string, any> = {};
    const expAttrNames: Record<string, string> = {};

    Object.entries(session).forEach(([key, value], idx) => {
      const attrName = `#field${idx}`;
      const attrValue = `:value${idx}`;
      updateExp.push(`${attrName} = ${attrValue}`);
      expAttrNames[attrName] = key;
      expAttrValues[attrValue] = value;
    });

    await client.send(
      new UpdateItemCommand({
        TableName: SESSIONS_TABLE,
        Key: marshall({ session_id: sessionId }),
        UpdateExpression: `SET ${updateExp.join(", ")}`,
        ExpressionAttributeNames: expAttrNames,
        ExpressionAttributeValues: marshall(expAttrValues, {
          removeUndefinedValues: true,
        }),
      })
    );

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: "Session updated successfully",
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
