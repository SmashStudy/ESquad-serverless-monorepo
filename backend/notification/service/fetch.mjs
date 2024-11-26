import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

const dynamoDb = new DynamoDBClient({ region: process.env.AWS_REGION });

const NOTIFICATION_TABLE = process.env.NOTIFICATION_DYNAMODB_TABLE;
const NOTIFICATION_CREATED_INDEX = process.env.NOTIFICATION_CREATED_INDEX;

// 특정 사용자에 대한 모든 알림을 시간 역순으로 조회
export const handler = async (event) => {
  console.log(`EVENT: \n${JSON.stringify(event, null, 2)}`);

  const { userId, lastEvaluatedKey } = JSON.parse(event.body);

  try {
    const queryParams = {
      TableName: NOTIFICATION_TABLE,
      IndexName: NOTIFICATION_CREATED_INDEX,
      KeyConditionExpression: "#userId = :userId", // GSI의 파티션 키(userId)와 비교하는 조건식
      ExpressionAttributeNames: {
        "#userId": "userId", // 'userId'라는 실제 필드명을 매핑
      },
      ExpressionAttributeValues: {
        // KeyConditionExpression에서 사용하는 값 정의
        ":userId": { S: userId },
      },
      Limit: 10,
      ScanIndexForward: false, // 시간 역순으로 정렬하기 위해 false 설정
    };

    if (lastEvaluatedKey) {
      queryParams.ExclusiveStartKey = JSON.parse(lastEvaluatedKey);
    }
    const command = new QueryCommand(queryParams);
    const response = await dynamoDb.send(command);
    const fetchResponse = {
      items: response.Items.map((data) => ({
        id: data.id.S,
        userId: data.userId.S,
        sender: data.sender.S,
        message: data.message.S,
        isRead: data.isRead.N,
        isSave: data.isSave.N,
        createdAt: data.createdAt.S,
      })),
      lastEvaluatedKey: response.LastEvaluatedKey
        ? JSON.stringify(response.LastEvaluatedKey)
        : null,
    };
    console.log(`Read notifications: ${JSON.stringify(fetchResponse)}`);
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
    console.error("Error while reading notifications :", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS, POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ error: "Failed to read notifications." }),
    };
  }
};
