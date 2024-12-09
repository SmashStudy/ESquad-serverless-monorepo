import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import {createResponse} from "../util/responseHelper.mjs";

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const NOTIFICATION_TABLE = process.env.NOTIFICATION_TABLE;

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);

  let { userId, id } = JSON.parse(event.body);
  console.log(`userId: ${userId}, id: ${id}`);

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
        userId: { S: userId }, // Partition key
        id: { S: id }, // Sort key
      },
      UpdateExpression: "SET isSave = :isSave, isRead = :newRead",
      ExpressionAttributeValues: {
        ":isSave": { N: "1" }, // isSave를 1로 설정
        ":newRead": { N: "1" }, // 조건이 만족되었을 때 isRead를 1로 설정
      },
      ReturnValues: "ALL_NEW", // 업데이트 후의 새로운 아이템을 반환하도록 설정
    };

    console.log(`updateParam: ${JSON.stringify(updateParam)}`);
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

    // 객체 형식으로 반환할 수 있도록 업데이트된 아이템을 resultObject에 저장
    return createResponse(200, {body: formattedResponse});
  } catch (error) {
    console.error("Error saving notification:", error);
    return createResponse(500, {
      error: "Failed saving notification.",
    });
  }
};
