import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import moment from "moment";

// DynamoDB 클라이언트 초기화
const client = new DynamoDBClient({ region: process.env.CHATTING_REGION });
const docClient = DynamoDBDocumentClient.from(client);

// 메시지 전송 함수
async function putItem(tableName, item) {
  const params = {
    TableName: tableName,
    Item: item,
  };

  try {
    await docClient.send(new PutCommand(params));
    console.log("Put succeeded");
  } catch (err) {
    console.error("Unable to add item. Error:", JSON.stringify(err, null, 2));
    throw err;
  }
}

// 메시지 수신 함수
export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const body = JSON.parse(event.body);
  const { room_id, message, user_id, file } = body;

  if (!room_id || !message || !user_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required fields" }),
    };
  }

  if (file && (!file.fileKey || !file.contentType || !file.originalFileName)) {
    console.error("File metadata missing or invalid:", file);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing file metadata fields for file message" }),
    };
  }

  const now = moment().valueOf();
  const item = {
    room_id,
    timestamp: now,
    message: message || null,
    user_id,
    fileKey: file?.fileKey || null, // 파일 메시지일 경우
    contentType: file?.contentType || null,
    originalFileName: file?.originalFileName || null,
  };

  if (file) {
    console.log("Storing file metadata:", file);
  }

  // DynamoDB에 메시지 PUT 하기
  try {
    await putItem(process.env.MESSAGE_TABLE_NAME, item);

    return {
      statusCode: 200,
      body: JSON.stringify({ result: "ok" }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to process put request" }),
    };
  }
};