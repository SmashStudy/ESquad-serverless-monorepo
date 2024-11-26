import moment from "moment";

import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const dynamodbClient = new DynamoDBClient({ region: process.env.AWS_REGION });

const CONNECTIONS_TABLE = process.env.NOTIFICATION_CONNECTIONS_DYNAMODB_TABLE;
const NOTIFICATION_CONNECTION_USER_INDEX =
  process.env.NOTIFICATION_WEBSOCKET_CONNECTION_USER_INDEX;

// 클라이언트 연결 요청 처리
export const handler = async (event) => {
  console.log(`EVENT: \n${JSON.stringify(event, null, 2)}`); // 이벤트 로그 출력

  let userId = event.queryStringParameters?.userId;
  userId = decodeURIComponent(userId);

  if (!userId)
    throw new Error("userId query parameter is required for $connect");

  try {

    // Check if the user already has a connection
    const queryParams = {
      TableName: CONNECTIONS_TABLE,
      IndexName: NOTIFICATION_CONNECTION_USER_INDEX,
      KeyConditionExpression: "userId = :userId", // GSI의 파티션 키(userId)와 비교하는 조건식
      ExpressionAttributeValues: {
        ":userId": { S: userId },
      },
    };

    const result = await dynamodbClient.send(new QueryCommand(queryParams));
    const connections = result.Items || [];

    if (connections.length === 0) {
      console.log(`No existing connections found for userId: ${userId}`);
    } else {
      for (const connection of connections) {
        const deleteParams = {
          TableName: CONNECTIONS_TABLE,
          Key: {
            connectionId: connection.connectionId.S,
          },
        };

        await dynamodbClient.send(new DeleteCommand(deleteParams));
        console.log(`Deleted connectionId: ${connection.connectionId.S}`);
      }
    }

    // TTL 값 계산 (1시간 후에 만료되는 항목으로 설정)
    const ttl = Math.floor(Date.now() / 1000) + 3600; // 현재 시간 + 3600초 (1시간)

    // 연결 정보를 DynamoDB에 저장
    const putParams = {
      TableName: CONNECTIONS_TABLE,
      Item: {
        connectionId: event.requestContext.connectionId,
        userId: userId,
        timestamp: moment().valueOf(),
        ttl: ttl,
      },
    };

    await dynamodbClient.send(new PutCommand(putParams));
    return {
      isBase64Encoded: true,
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error while connecting WebSocket event:", error);
    return {
      isBase64Encoded: true,
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal error occurred while connecting socket",
      }),
    };
  }
};
