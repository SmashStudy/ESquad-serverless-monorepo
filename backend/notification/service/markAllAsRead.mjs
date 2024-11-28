import {createResponse} from "../util/responseHelper.mjs";
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

  let userId, notificationIds;

  // Event 파싱과 유효성 검사
  try {
    const body = JSON.parse(event.body);
    userId = body.userId;
    notificationIds = body.notificationIds;

    if (!userId || !notificationIds || notificationIds.length === 0) {
      return createResponse(400, {
        error: "Required parameter is invalid.",
      });
    }
  } catch (error) {
    console.error("Error parsing event body:", error);
    return createResponse(400, {
      error: "Invalid request body.",
    });
  }

  // 알림 업데이트
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

    // 병렬 처리
    await Promise.all(updatePromises);
    console.log("All notifications marked as read successfully");

    return createResponse(200, {
      body: notificationIds,
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return createResponse(500, {
      error: "Failed to mark notifications as read.",
    });
  }
};
