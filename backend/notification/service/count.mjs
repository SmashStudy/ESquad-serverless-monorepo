import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import {createResponse} from '../util/responseHelper.mjs'

const dynamoDb = new DynamoDBClient({ region: process.env.AWS_REGION });

const NOTIFICATION_TABLE = process.env.NOTIFICATION_DYNAMODB_TABLE;
const CONNECTIONS_TABLE = process.env.NOTIFICATION_CONNECTIONS_DYNAMODB_TABLE;
const ENDPOINT = process.env.WEBSOCKET_ENDPOINT;

// WebSocket 으로 메시지 전송
const sendToConnection = async (connectionId, payload) => {
  if (!connectionId || !payload) {
    throw new Error("connectionId와 message는 필수입니다."); // 필수 매개변수 검증
  }

  const apiClient = new ApiGatewayManagementApiClient({
    endpoint: ENDPOINT,
  });

  try {
    await apiClient.send(
      new PostToConnectionCommand({
        ConnectionId: connectionId,
        Data: JSON.stringify(payload), // 메시지를 JSON 형식으로 전송
      })
    );
    console.log(`Message sent to connectionId ${connectionId}`);
  } catch (error) {
    console.error("Failed to send message:", error);
  }
};

// 1. 특정 사용자에 대한 미확인 알림 개수 반환
export const handler = async (event) => {
  console.log(`EVENT: \n${JSON.stringify(event, null, 2)}`);

  const { userId } = JSON.parse(event.body);
  const connectionId = event.requestContext.connectionId;

  try {
    const countParams = {
      TableName: NOTIFICATION_TABLE,
      KeyConditionExpression: "#userId = :userId", // GSI의 파티션 키(userId)와 비교하는 조건식
      FilterExpression: "isRead = :isRead",
      ExpressionAttributeNames: {
        "#userId": "userId", // 'userId'라는 실제 필드명을 매핑
      },
      ExpressionAttributeValues: {
        // KeyConditionExpression에서 사용하는 값 정의
        ":userId": { S: userId },
        ":isRead": { N: "0" },
      },
      Select: "COUNT", // Count를 가져오는 옵션
    };

    const countCommand = new QueryCommand(countParams);
    const countResult = await dynamoDb.send(countCommand);
    const unReadCount = countResult.Count;
    console.log(`Read notifications: ${JSON.stringify(unReadCount)}`);
    await sendToConnection(connectionId, { unReadCount });
    return createResponse(200,
        {message: `Success for count notifications!`});
  } catch (error) {
    if (error.name === "GoneException") {
      // 클라이언트가 연결을 끊었을 경우 해당 연결을 DynamoDB에서 삭제
      console.error(
        `Connection ${connectionId} is gone, deleting from DynamoDB`
      );
      await dynamoDb.send(
        new DeleteCommand({
          TableName: CONNECTIONS_TABLE,
          Key: { connectionId },
        })
      );
      return createResponse(400,
          {error: `Connection missed. Deleted from Server`});
    } else {
      console.error(
        `Failed to send message to connection ${connectionId}:`,
        error
      );
      return createResponse(500,
          {error: `Failed to send message to client`});
    }
  }
};
