import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const NOTIFICATION_TABLE = process.env.NOTIFICATION_DYNAMODB_TABLE;

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);

  let { userId, id } = event.queryStringParameters || {};
  console.log(`userId: ${userId}, id: ${id}`);
  userId = decodeURIComponent(userId);
  id = decodeURIComponent(id);

  // Check if the required parameters are provided
  if (!userId || !id) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // Development stage: '*' for all, restrict in production
      },
      body: JSON.stringify({
        error: "userId and id must be provided as query parameters.",
      }),
    };
  }

  try {
    // 해당 알림 저장 처리
    const updateParam = {
      TableName: NOTIFICATION_TABLE,
      Key: {
        userId: { S: userId },
        id: { S: id },
      },
      UpdateExpression: "SET isSave = :isSave",
      ExpressionAttributeValues: {
        ":isSave": 0,
      },
      ExpressionAttributeValues: {
        ":isSave": { N: "1" }, // Assuming isSave is stored as a number
      },
      ConditionExpression: "attribute_exists(id)",
      ReturnValues: "ALL_NEW", // 업데이트 후의 새로운 아이템을 반환하도록 설정
    };

    const updateCommand = new UpdateCommand(updateParam);
    const result = await dynamoDbClient.send(updateCommand);
    console.log(`Updated: ${JSON.stringify(result.Attributes)}`);

    // 객체 형식으로 반환할 수 있도록 업데이트된 아이템을 resultObject에 저장
    const resultObject = result.Attributes;
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*", // 개발 단계: '*', 프로덕션: 특정 도메인
        "Access-Control-Allow-Methods": "OPTIONS, POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify(resultObject),
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
