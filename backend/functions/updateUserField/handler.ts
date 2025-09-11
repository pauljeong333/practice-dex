import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { verifyUser } from "../utils/auth";

const client = new DynamoDBClient({});
const USERS_TABLE = process.env.USERS_TABLE!;

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

    const { uid, fields } = JSON.parse(event.body || "{}");

    if (!uid || !fields) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "uid and fields are required" }),
      };
    }

    if (uid !== authUid) {
      return {
        statusCode: 403,
        headers,
        body: JSON.stringify({ error: "UID in body doesn't match token" }),
      };
    }

    const setExprs: string[] = [];
    const removeExprs: string[] = [];
    const exprAttrValues: Record<string, any> = {};

    Object.keys(fields).forEach((key, i) => {
      const value = fields[key];
      if (value === null) {
        removeExprs.push(key);
      } else {
        const placeholder = `:val${i}`;
        setExprs.push(`${key} = ${placeholder}`);
        exprAttrValues[placeholder] = value;
      }
    });

    let updateExpression = "";
    if (setExprs.length > 0) updateExpression += `SET ${setExprs.join(", ")}`;
    if (removeExprs.length > 0) {
      if (updateExpression) updateExpression += " ";
      updateExpression += `REMOVE ${removeExprs.join(", ")}`;
    }

    const command = new UpdateItemCommand({
      TableName: USERS_TABLE,
      Key: marshall({ uid }),
      UpdateExpression: updateExpression,
      ExpressionAttributeValues:
        Object.keys(exprAttrValues).length > 0
          ? marshall(exprAttrValues)
          : undefined,
      ReturnValues: "ALL_NEW", // return updated item
    });

    const result = await client.send(command);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        user: result.Attributes ? unmarshall(result.Attributes) : null,
      }),
    };
  } catch (error: any) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Failed to update user" }),
    };
  }
};
