import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
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

    // Reject if body.uid doesn't match token uid (to prevent spoofing)
    const { uid, email, displayName } = JSON.parse(event.body);
    if (uid !== authUid) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: "UID in body doesn't match token" }),
      };
    }

    // Get current ISO timestamp
    const dateCreated = new Date().toISOString();

    // Write to DynamoDB
    const command = new PutItemCommand({
      TableName: process.env.USERS_TABLE,
      Item: {
        uid: { S: uid },
        email: { S: email || "unknown" },
        displayName: { S: displayName || "User" },
        dateCreated: { S: dateCreated },
        isNewUser: { BOOL: true }, // default onboarding flag
      },
      ConditionExpression: "attribute_not_exists(uid)", // prevents overwrite
    });

    await client.send(command);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "User created" }),
    };
  } catch (error: any) {
    console.error("Error:", error);

    if (error.name === "ConditionalCheckFailedException") {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ message: "User already exists (idempotent)" }),
      };
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to sync user" }),
    };
  }
};
