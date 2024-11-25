import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const dynamoDb = DynamoDBDocumentClient.from(dynamoDbClient);
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
        userId: userId, // userId 값 제공
        id: id, // id 값 제공
      },
      UpdateExpression: "SET isSave = :isSave, isRead = :newRead",
      // UpdateExpression:
      // - "SET isSave = :isSave": isSave 필드를 1로 설정합니다.
      // - "isRead = :newRead": 조건에 따라 isRead 값을 1로 설정합니다.

      ConditionExpression: "isRead = :isReadZero",
      // ConditionExpression:
      // - "isRead = :isReadZero": isRead 값이 0인 경우에만 업데이트가 실행됩니다.
      // - "attribute_not_exists(isRead)": isRead 속성이 존재하지 않을 경우에도 업데이트가 실행됩니다.

      ExpressionAttributeValues: {
        ":isSave": { N: "1" }, // isSave를 1로 설정하기 위한 값입니다.
        ":isReadZero": { N: "0" }, // 조건에서 isRead 값이 0인지 확인하기 위한 값입니다.
        ":newRead": { N: "1" }, // 조건이 만족되었을 때 isRead를 1로 설정하기 위한 값입니다.
      },
      ReturnValues: "ALL_NEW", // 업데이트 후의 새로운 아이템을 반환하도록 설정
    };

    const result = await dynamoDb.send(new UpdateCommand(updateParam));
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
