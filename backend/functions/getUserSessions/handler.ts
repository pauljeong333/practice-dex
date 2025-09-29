import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { verifyUser } from "../utils/auth";

const client = new DynamoDBClient({});
const SESSIONS_TABLE = process.env.SESSIONS_TABLE!;
const GSI_NAME = "UidDateCreatedIndex";

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

    const { uid } = JSON.parse(event.body);
    if (!uid || uid !== authUid) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: "UID missing or doesn't match token" }),
      };
    }

    // Query the GSI
    const result = await client.send(
      new QueryCommand({
        TableName: SESSIONS_TABLE,
        IndexName: "UidStatusDateCreatedIndex",
        KeyConditionExpression: "uid_status = :uid_status",
        ExpressionAttributeValues: {
          ":uid_status": { S: `${uid}#completed` },
        },
        ScanIndexForward: false,
      })
    );

    const sessions = result.Items?.map((item) => unmarshall(item)) ?? [];

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ sessions }),
    };
  } catch (error: any) {
    console.error("Error querying sessions:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to query sessions" }),
    };
  }
};
