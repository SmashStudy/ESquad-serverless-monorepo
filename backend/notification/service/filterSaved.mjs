import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const NOTIFICATION_TABLE = process.env.NOTIFICATION_DYNAMODB_TABLE;
const NOTIFICATION_SAVE_INDEX = process.env.NOTIFICATION_SAVE_INDEX;

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
      IndexName: NOTIFICATION_SAVE_INDEX,
      KeyConditionExpression: "userId = :userId AND isSave = :isSave",
      ExpressionAttributeValues: {
        ":userId": { S: userId },
        ":isSave": { N: "1" },
      },
      Limit: 10,
    };

    if (lastEvaluatedKey) {
      queryParams.ExclusiveStartKey = JSON.parse(lastEvaluatedKey);
    }

    const command = new QueryCommand(queryParams);
    const response = await dynamoDbClient.send(command);
    const fetchResponse = {
      items: response.Items.map((data) => ({
        id: data.id.S,
        userId: data.userId.S,
        sender: data.sender.S,
        message: data.message.S,
        isRead: data.isRead.N,
        isSave: data.isSave.N,
        createdAt: data.createdAt.S,
      })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), // 역순 정렬
      lastEvaluatedKey: response.LastEvaluatedKey
        ? JSON.stringify(response.LastEvaluatedKey)
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
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS, GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ error: "Failed to mark notifications as read." }),
    };
  }
};
