import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export const handler = async (event: any) => {
  const headers = {
    "Access-Control-Allow-Origin": "*", // Or specify your frontend URL
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
  };

  try {
    const { uid, email, displayName } = JSON.parse(event.body);

    const command = new PutItemCommand({
      TableName: process.env.USERS_TABLE,
      Item: {
        uid: { S: uid },
        email: { S: email || "unknown" },
        displayName: { S: displayName || "User" },
      },
    });

    await client.send(command);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "User synced" }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to sync user" }),
    };
  }
};
