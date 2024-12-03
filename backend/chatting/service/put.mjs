import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

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
    console.log("Put succeeded", JSON.stringify(item, null, 2));
  } catch (err) {
    console.error("Unable to add item. Error:", JSON.stringify(err, null, 2));
    throw err;
  }
}

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
        console.log(`Stale connection detected, removing connection_id: ${connection_id}`);
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

// 메시지 수신 함수
export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const body = JSON.parse(event.body);
  const { room_id, message, user_id, fileKey, presignedUrl, contentType, originalFileName, timestamp } = body;

  if (!room_id || !message || !user_id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required fields" }),
    };
  }

  // const now = moment().valueOf();
  const item = {
    room_id: String(room_id),
    timestamp: timestamp,
    message: message || null,
    user_id: String(user_id),
    isFile: fileKey ? true : false, // 파일 여부 플래그 추가
    fileKey: fileKey ? fileKey : null,
    presignedUrl: fileKey ? presignedUrl : null,
    contentType: fileKey ? contentType : null,
    originalFileName: fileKey ? originalFileName : null,
  };
  console.log("Attempting to put item in DynamoDB:", JSON.stringify(item, null, 2));

  // DynamoDB에 메시지 PUT 하기
  try {
    await putItem(process.env.MESSAGE_TABLE_NAME, item);

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
        "Access-Control-Allow-Origin": "*", // 모든 출처 허용
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
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