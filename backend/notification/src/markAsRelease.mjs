import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import {createResponse} from "../util/responseHelper.mjs";

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const NOTIFICATION_TABLE = process.env.NOTIFICATION_TABLE;

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);

  let { userId, id } = JSON.parse(event.body);
  console.log(`userId: ${userId}, id: ${id}`);

  // Check if the required parameters are provided
  if (!userId || !id) {
    return createResponse(400, {
      error: "Required parameter is invalid.",
    });
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

    return createResponse(200, {body: formattedResponse});
  } catch (error) {
    console.error("Error release marking notifications:", error);
    return createResponse(500, {
      error: "Failed to release mark notifications.",
    });
  }
};
