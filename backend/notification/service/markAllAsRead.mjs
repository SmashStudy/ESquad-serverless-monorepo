import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const NOTIFICATION_TABLE = process.env.NOTIFICATION_DYNAMODB_TABLE;

// Retry mechanism function with exponential backoff
const updateItemWithRetry = async (params, maxRetries = 3, delay = 200) => {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Attempt to send the UpdateItemCommand
      await dynamoDbClient.send(new UpdateItemCommand(params));
      console.log(
        `Successfully updated item with params: ${JSON.stringify(params.Key)}`
      );
      return; // Success, exit function
    } catch (error) {
      // If maximum retries reached, throw error
      if (attempt === maxRetries - 1) {
        console.error(
          `Max retries reached for updating item with params: ${JSON.stringify(
            params.Key
          )}`
        );
        throw error;
      }

      // Log error and wait before retrying
      console.warn(
        `Attempt ${attempt + 1} failed for updating item: ${JSON.stringify(
          params.Key
        )}. Retrying...`,
        error
      );

      // Exponential backoff delay before the next retry
      const backoffDelay = delay * Math.pow(2, attempt); // Exponential backoff delay
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
        error: "No User ID or Notification IDs provided.",
      }),
    };
  }

  try {
    // Mark all notifications as read using retry mechanism
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
      // Execute update command with retry mechanism
      return updateItemWithRetry(updateParams);
    });

    // Execute all update requests concurrently
    try {
      await Promise.all(updatePromises);
      console.log("All notifications marked as read successfully");
    } catch (error) {
      console.error("Failed to mark some or all notifications as read:", error);
      // Optionally: add logic to handle failed updates if needed, like logging failed IDs.
    }

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // 개발 단계: '*', 프로덕션: 특정 도메인
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
        "Access-Control-Allow-Origin": "*", // 개발 단계: '*', 프로덕션: 특정 도메인
        "Access-Control-Allow-Methods": "OPTIONS, POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ error: "Failed to mark notifications as read." }),
    };
  }
};
