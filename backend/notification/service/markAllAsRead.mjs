import {createResponse} from "../util/responseHelper.mjs";

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
      message: "Notifications marked as read.",
    });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return createResponse(500, {
      error: "Failed to mark notifications as read.",
    });
  }
};
