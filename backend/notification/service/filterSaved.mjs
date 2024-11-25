import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const NOTIFICATION_TABLE = process.env.NOTIFICATION_DYNAMODB_TABLE;
const NOTIFICATION_CREATED_INDEX = process.env.NOTIFICATION_CREATED_INDEX;

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);

  const { userId, lastEvaluatedKey } = JSON.parse(event.body);

  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No User IDs provided." }),
    };
  }

  try {
    // 보관처리된 알림 모두 조회
    const queryParams = {
      TableName: NOTIFICATION_TABLE,
      IndexName: NOTIFICATION_CREATED_INDEX,
      KeyConditionExpression: "#userId = :userId",
      ExpressionAttributeNames: {
        "#userId": "userId",
      },
      ExpressionAttributeValues: {
        ":userId": { S: userId },
      },
      Limit: 10, // Limit results as required
      ScanIndexForward: false, // Sort in reverse chronological order
    };

    // Add ExclusiveStartKey if this is a paginated request
    if (lastEvaluatedKey) {
      queryCommand.ExclusiveStartKey = JSON.parse(lastEvaluatedKey);
    }

    // Execute the query
    const command = new QueryCommand(queryParams);
    const rawData = await dynamoDbClient.send(command);

    // Extract the fetched items and the LastEvaluatedKey for pagination
    const fetchResponse = {
      items: rawData.Items.map((data) => ({
        id: data.id.S,
        userId: data.userId.S,
        sender: data.sender.S,
        message: data.message.S,
        isRead: data.isRead.N,
        isSave: data.isSave.N,
        createdAt: data.createdAt.S,
      })),
      lastEvaluatedKey: rawData.LastEvaluatedKey
        ? JSON.stringify(rawData.LastEvaluatedKey)
        : null,
    };

    console.log(
      `Read notifications in reverse chronological order: ${JSON.stringify(
        fetchResponse
      )}`
    );
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS, POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify(fetchResponse),
    };
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // 개발 단계: '*', 프로덕션: 특정 도메인
        "Access-Control-Allow-Methods": "OPTIONS, GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ error: "Failed to mark notifications as read." }),
    };
  }
};
