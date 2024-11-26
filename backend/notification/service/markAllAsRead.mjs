import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const NOTIFICATION_TABLE = process.env.NOTIFICATION_DYNAMODB_TABLE;

// 재시도 메커니즘을 사용하여 항목 업데이트 함수 (지수 백오프 적용)
const updateItemWithRetry = async (params, maxRetries = 3, delay = 200) => {
  // 최대 재시도 횟수만큼 반복 시도
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Attempt to send the UpdateItemCommand
      await dynamoDbClient.send(new UpdateItemCommand(params));
      console.log(
        `Successfully updated item with params: ${JSON.stringify(params.Key)}`
      );
      return; // 성공 시 함수 종료
    } catch (error) {
      // 최대 재시도 횟수에 도달했을 경우 오류
      if (attempt === maxRetries - 1) {
        console.error(
          `Max retries reached for updating item with params: ${JSON.stringify(
            params.Key
          )}`
        );
        throw error;
      }

      // 오류 로그를 기록하고 재시도 전에 대기
      console.warn(
        `Attempt ${attempt + 1} failed for updating item: ${JSON.stringify(
          params.Key
        )}. Retrying...`,
        error
      );

      // 지수 백오프 방식의 대기 시간을 계산하여 대기 후 재시도
      const backoffDelay = delay * Math.pow(2, attempt);
      await new Promise((res) => setTimeout(res, backoffDelay));
    }
  }
};

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);

  const { userId, notificationIds } = JSON.parse(event.body);
  console.log(`userId: ${userId}, notificationIds: ${notificationIds}`);

  if (!userId || !notificationIds || notificationIds.length === 0) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "No User ID or NotificationItem IDs provided.",
      }),
    };
  }

  try {
    // 재시도 메커니즘을 이용하여 업데이트
    const updatePromises = notificationIds.map((notificationId) => {
      const updateParams = {
        TableName: NOTIFICATION_TABLE,
        Key: {
          userId: { S: userId },
          id: { S: notificationId },
        },
        UpdateExpression: "SET isRead = :isRead",
        ExpressionAttributeValues: {
          ":isRead": { N: "1" },
        },
      };
      return updateItemWithRetry(updateParams);
    });

    // 모든 업데이트 요청 병렬 처리
    try {
      await Promise.all(updatePromises);
      console.log("All notifications marked as read successfully");
    } catch (error) {
      console.error("Failed to mark some or all notifications as read:", error);
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS, POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({
        message: "Notifications marked as read.",
      }),
    };
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS, POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ error: "Failed to mark notifications as read." }),
    };
  }
};
