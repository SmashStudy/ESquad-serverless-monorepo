import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import {createResponse} from "../util/responseHelper.mjs";

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const NOTIFICATION_CONNECTION_TABLE =
  process.env.NOTIFICATION_CONNECTION_TABLE;
const NOTIFICATION_CONNECTION_USER_INDEX =
  process.env.NOTIFICATION_CONNECTION_USER_INDEX;
const WEBSOCKET_RESOURCE_ID = process.env.WEBSOCKET_RESOURCE_ID;

// 사용자ID 로 연결ID 조회
const getConnectionIds = async (userId) => {
  const params = {
    TableName: NOTIFICATION_CONNECTION_TABLE,
    IndexName: NOTIFICATION_CONNECTION_USER_INDEX,
    KeyConditionExpression: "#userId = :userId",
    ExpressionAttributeNames: {
      "#userId": "userId", // Handle reserved characters
    },
    ExpressionAttributeValues: {
      ":userId": { S: userId }, // Dynamically provide the userId value
    },
  };

  try {
    const command = new QueryCommand(params);
    const result = await dynamoClient.send(command);
    console.log(
      `Notification Connection Table result: ${JSON.stringify(result.Items)}`
    );

    return result.Items.map((item) => item.connectionId.S);
  } catch (error) {
    console.error("Error fetching connection IDs:", error);
    return [];
  }
};

// 연결된 웹소캣 커넥션(클라이언트)에 메시지 전송
const sendToConnection = async (connectionId, studyNotification) => {
  const notification = { studyNotification };
  const apiClient = new ApiGatewayManagementApiClient({
    endpoint: `https://${WEBSOCKET_RESOURCE_ID}.execute-api.${process.env.STAGE}.amazonaws.com/${process.env.STAGE}`,
  })

  try {
    const command = new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: Buffer.from(JSON.stringify(notification)), // 메시지를 JSON 형식으로 전송
    });
    await apiClient.send(command);
    console.log(`Message sent to connectionId ${connectionId}`);
  } catch (error) {
    if (error.statusCode === 410) {
      console.error(`Connection ${connectionId} is gone.`);
    } else {
      console.error(
        `Failed to send message to connection ${connectionId}:`,
        error
      );
      return createResponse(500, {
        error: "Failed to send message to user",
      });
    }
  }
};

export const handler = async (event) => {
  try {
    console.log("DynamoDB Stream Event:", JSON.stringify(event));

    for (const record of event.Records) {
      if (record.eventName !== "INSERT") continue;

      const newImage = record.dynamodb.NewImage;

      if (!newImage) {
        console.warn("No New Image found, skipping record.");
        continue;
      }

      const sendNotification = {
        id: newImage.id?.S,
        userId: newImage.userId?.S,
        createdAt: newImage.createdAt?.S,
        isRead: newImage.isRead?.N,
        isSave: newImage.isSave?.N,
        message: newImage.message?.S,
        sender: newImage.sender?.S,
      };
      console.log(
        `New notification for userId ${sendNotification.userId}: ${sendNotification.message}`
      );

      // Fetch WebSocket connections for the user
      const connectionIds = await getConnectionIds(sendNotification.userId);

      if (connectionIds.length === 0) {
        console.warn(
          `No active connections found for userId ${sendNotification.userId}`
        );
        continue;
      }

      // Send notification to each connection
      await Promise.all(
        connectionIds.map((id) => sendToConnection(id, sendNotification))
      );
    }

    return createResponse(200, {
      message: "Notifications sent successfully.",
    });
  } catch (error) {
    console.error("Error processing DynamoDB Stream event:", error);
    return createResponse(500, {
      error: "Error while processing DynamoDB Stream event",
    });
  }
};
