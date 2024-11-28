import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const NOTIFICATION_TABLE = process.env.NOTIFICATION_DYNAMODB_TABLE;

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);

  let { userId, id } = JSON.parse(event.body);
  console.log(`userId: ${userId}, id: ${id}`);

  // Check if the required parameters are provided
  if (!userId || !id) {
    return {
      statusCode: 400,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
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
        ":isSave": { N: "0" },
      },
      ReturnValues: "ALL_NEW", // 업데이트 후의 새로운 아이템을 반환하도록 설정
    };

    const result = await dynamoDbClient.send(
      new UpdateItemCommand(updateParam)
    );
    const formattedResponse = {
      id: result.Attributes.id.S,
      userId: result.Attributes.userId.S,
      sender: result.Attributes.sender.S,
      message: result.Attributes.message.S,
      isRead: result.Attributes.isRead.N,
      isSave: result.Attributes.isSave.N,
      createdAt: result.Attributes.createdAt.S,
    };
    console.log(`formattedResponse: ${JSON.stringify(formattedResponse)}`);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS, PUT",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify(formattedResponse),
    };
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS, PUT",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ error: "Failed to mark notifications as read." }),
    };
  }
};
