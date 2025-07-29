import { APIGatewayProxyHandler } from "aws-lambda";
import { v4 as uuidv4 } from "uuid";
import { DynamoDB } from "aws-sdk";

const db = new DynamoDB.DocumentClient();
const SESSIONS_TABLE = process.env.SESSIONS_TABLE!;

export const handler: APIGatewayProxyHandler = async (event) => {
  const userId = event.requestContext.authorizer?.claims.sub;
  const { instrument, duration, goals } = JSON.parse(event.body || "{}");

  const session = {
    session_id: uuidv4(),
    user_id: userId,
    instrument,
    duration,
    goals,
    completed_at: new Date().toISOString(),
  };

  await db
    .put({
      TableName: SESSIONS_TABLE,
      Item: session,
    })
    .promise();

  return {
    statusCode: 201,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type,Authorization",
    },
    body: JSON.stringify({ message: "Session saved", session }),
  };
};
