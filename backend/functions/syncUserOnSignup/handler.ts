import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { verifyUser } from "../utils/auth";

const client = new DynamoDBClient({});

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

    const { uid, email, displayName } = JSON.parse(event.body || "{}");
    if (uid !== authUid) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: "UID in body doesn't match token" }),
      };
    }

    const dateCreated = new Date().toISOString();

    // UpdateItem with conditional creation if not exists
    const command = new UpdateItemCommand({
      TableName: process.env.USERS_TABLE,
      Key: { uid: { S: uid } },
      UpdateExpression: `
        SET email = if_not_exists(email, :email),
            displayName = if_not_exists(displayName, :displayName),
            dateCreated = if_not_exists(dateCreated, :dateCreated),
            isNewUser = if_not_exists(isNewUser, :isNewUser)
      `,
      ExpressionAttributeValues: {
        ":email": { S: email || "unknown" },
        ":displayName": { S: displayName || "User" },
        ":dateCreated": { S: dateCreated },
        ":isNewUser": { BOOL: true },
      },
      ReturnValues: "ALL_NEW", // returns all attributes after update
    });

    const result = await client.send(command);

    // Convert all attributes into a plain JS object
    const user = result.Attributes ? unmarshall(result.Attributes) : {};

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ user }),
    };
  } catch (error: any) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to sync user" }),
    };
  }
};
