import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";

const CONNECTIONS_TABLE = process.env.NOTIFICATION_CONNECTIONS_DYNAMODB_TABLE;

const dynamodbClient = new DynamoDBClient({ region: process.env.AWS_REGION });

// 클라이언트 연결 해제 요청 처리
export const handler = async (event) => {
  console.log(`EVENT: \n${JSON.stringify(event, null, 2)}`); // 이벤트 로그 출력

  try {
    await dynamodbClient.send(
      new DeleteCommand({
        TableName: CONNECTIONS_TABLE,
        Key: {
          connectionId: event.requestContext.connectionId, // connectionId를 기반으로 삭제
        },
      })
    );

    return {
      isBase64Encoded: true,
      statusCode: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Expose-Headers": "*",
        "Access-Control-Allow-Origin": "*",
      },
      body: "Disconnected",
    };
  } catch (error) {
    console.error("Error while disconnecting WebSocket event:", error);
    return {
      isBase64Encoded: true,
      statusCode: 500,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Access-Control-Expose-Headers": "*",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ error: "Failed to disconnect" }),
    };
  }
};
