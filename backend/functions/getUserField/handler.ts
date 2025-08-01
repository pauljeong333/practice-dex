import { APIGatewayProxyHandler } from "aws-lambda";
import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { verifyUser } from "../utils/auth.ts";

const dynamo = new DynamoDBClient({});

export const handler: APIGatewayProxyHandler = async (event, _context) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
  };

  try {
    const decoded = await verifyUser(event);
    const uid = decoded.uid;

    console.log("uid:", uid);

    // Extract 'field' query parameter
    const field = event.queryStringParameters?.field;
    if (!field) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "Missing 'field' query parameter" }),
      };
    }

    // Get item from DynamoDB
    const command = new GetItemCommand({
      TableName: process.env.USERS_TABLE,
      Key: { uid: { S: uid } },
      ProjectionExpression: field,
    });

    console.log("GetItem params:", JSON.stringify(command));

    const result = await dynamo.send(command);
    const value = result.Item?.[field];

    if (!value) {
      return {
        statusCode: 404,
        headers,
        body: JSON.stringify({ error: `Field '${field}' not found for user` }),
      };
    }

    // Extract actual value depending on DynamoDB type
    const parsedValue =
      value.S ??
      value.N ??
      value.BOOL ??
      value.NULL ??
      value.L ??
      value.M ??
      null;

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ [field]: parsedValue }),
    };
  } catch (err) {
    console.error("Error in getUserField:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Internal server error" }),
    };
  }
};
