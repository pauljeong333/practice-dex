import {
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { DynamoDBChatMessageHistory } from "@langchain/community/stores/message/dynamodb";
import crypto from "crypto";

const dynamoDB = new DynamoDBClient({ region: process.env.AWS_REGION });
const CHAT_METADATA_TABLE = process.env.CHAT_METADATA_TABLE!;
const CHAT_HISTORY_TABLE = process.env.CHAT_HISTORY_TABLE!;

interface GetOrCreateChatIdParams {
  uid: string;
  instrument: string;
  newChat?: boolean;
}

/** Get or create a chatId for this user + instrument combo */
async function getOrCreateChatId({
  uid,
  instrument,
  newChat = false,
}: GetOrCreateChatIdParams): Promise<string> {
  // If user explicitly requested a new chat, always create one
  if (newChat) {
    const chatId = crypto.randomUUID();
    await saveChatMetadata(uid, instrument, chatId);
    return chatId;
  }

  // Otherwise, try to find an existing one
  const existing = await getChatMetadata(uid, instrument);
  if (existing) {
    return existing;
  }

  // None exists → create and save new one
  const chatId = crypto.randomUUID();
  await saveChatMetadata(uid, instrument, chatId);
  return chatId;
}

async function getChatMetadata(
  uid: string,
  instrument: string
): Promise<string | null> {
  const command = new GetItemCommand({
    TableName: CHAT_METADATA_TABLE,
    Key: {
      uid: { S: uid },
      instrument: { S: instrument },
    },
  });

  const result = await dynamoDB.send(command);
  return result.Item?.chatId?.S ?? null;
}

async function saveChatMetadata(
  uid: string,
  instrument: string,
  chatId: string
): Promise<void> {
  const command = new PutItemCommand({
    TableName: CHAT_METADATA_TABLE,
    Item: {
      uid: { S: uid },
      instrument: { S: instrument },
      chatId: { S: chatId },
      createdAt: { N: Date.now().toString() },
    },
  });

  await dynamoDB.send(command);
}

// 🧠 Usage example inside your chat handler
export async function getMessageHistory(
  uid: string,
  instrument: string,
  newChat?: boolean
) {
  const chatId = await getOrCreateChatId({ uid, instrument, newChat });

  const messageHistory = new DynamoDBChatMessageHistory({
    tableName: CHAT_HISTORY_TABLE,
    sessionId: chatId,
    partitionKey: "sessionId",
    sortKey: "timestamp",
    config: { region: process.env.AWS_REGION },
  });

  return { messageHistory, chatId };
}
