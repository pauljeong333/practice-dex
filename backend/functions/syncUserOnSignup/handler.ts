import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({});

export const handler = async (event) => {
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
    body: JSON.stringify({ message: "User synced" }),
  };
};
