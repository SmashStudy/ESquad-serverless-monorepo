import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

// DynamoDB 클라이언트 초기화
const client = new DynamoDBClient({ region: process.env.CHATTING_REGION });
const docClient = DynamoDBDocumentClient.from(client);

const MESSAGE_TABLE = process.env.MESSAGE_TABLE_NAME;

// 닉네임, 메시지 저장
async function putItemWithNickname(tableName, item) {
  const params = {
    TableName: tableName,
    Item: item,
  };
  try {
    await docClient.send(new PutCommand(params));
  } catch (err) {
    console.error("Unable to add item. Error:", JSON.stringify(err));
    throw err;
  }
}

// WebSocket 브로드캐스트
async function broadcastMessage(apiGatewayManagementApi, connections, message) {
  const postCalls = connections.map(async ({ connection_id }) => {
    try {
      await apiGatewayManagementApi.send(
          new PostToConnectionCommand({
            ConnectionId: connection_id,
            Data: JSON.stringify(message),
          })
      );
    } catch (e) {
      if (e.statusCode === 410) {
        await docClient.send(
            new DeleteCommand({
              TableName: process.env.USERLIST_TABLE_NAME,
              Key: { connection_id },
            })
        );
      } else {
        console.error(`Failed to send message to connection_id: ${connection_id}`, e);
      }
    }
  });
  await Promise.all(postCalls);
}

export const handler = async (event) => {

  const body = JSON.parse(event.body);
  const { room_id, message, user_id, nickname, fileKey, contentType, originalFileName, timestamp } = body;

  if (!room_id || !message || !user_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required fields" }),
    };
  }

    const item = {
    room_id: String(room_id),
    timestamp: timestamp,
    message: message || null,
    user_id: String(user_id),
    nickname: nickname,
    isFile: fileKey ? true : false,
    fileKey: fileKey || null,
    contentType: contentType || null,
    originalFileName: originalFileName || null,
  };

  try {
    // 메시지 저장
    await putItemWithNickname(MESSAGE_TABLE, item);

    // WebSocket API Gateway 클라이언트 초기화
    const apiGatewayManagementApi = new ApiGatewayManagementApiClient({
      apiVersion: "2018-11-29",
      endpoint: `${event.requestContext.domainName}/${event.requestContext.stage}`,
    });

    // 연결된 클라이언트 조회
    const connectionsResult = await docClient.send(
        new QueryCommand({
          TableName: process.env.USERLIST_TABLE_NAME,
          IndexName: "room_id-user_id-index",
          KeyConditionExpression: "room_id = :room_id",
          ExpressionAttributeValues: {
            ":room_id": room_id,
          },
        })
    );

    const connections = connectionsResult.Items || [];

    // 새 메시지를 WebSocket 클라이언트에 브로드캐스트
    const newMessage = {
      type: "newMessage",
      ...item,
    };

    await broadcastMessage(apiGatewayManagementApi, connections, newMessage);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': `${process.env.ALLOWED_ORIGIN}`,
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      body: JSON.stringify({ result: "ok" }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to process put request", details: error.message }),
    };
  }
};