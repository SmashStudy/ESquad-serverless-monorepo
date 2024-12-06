import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { createResponse } from "../utils/responseHelper.mjs";

const ddbClient = new DynamoDBClient({ region: process.env.REGION });

export const handler = async (event) => {
  try {
    const { postId } = event.pathParameters;
    const { createdAt } = event.queryStringParameters;
    const { resolved } = JSON.parse(event.body);

    // 필수 파라미터 검증
    if (!postId || !createdAt) {
      return createResponse(400, {
        message: "Missing required parameters: postId or createdAt",
      });
    }

    if (resolved === undefined) {
      return createResponse(400, {
        message: "The resolved field is required.",
      });
    }

    // resolved 값을 반전하여 업데이트할 값 정의
    const updatedResolved = !resolved;

    // DynamoDB UpdateItemCommand 파라미터 정의
    const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: { S: `POST#${postId}` },
        SK: { S: createdAt },
      },
      UpdateExpression: "SET #resolved = :resolved, #updatedAt = :updatedAt",
      ExpressionAttributeNames: {
        "#resolved": "resolved",
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: {
        ":resolved": { S: updatedResolved.toString() }, // Boolean -> String 변환
        ":updatedAt": { S: new Date().toISOString() },
      },
      ReturnValues: "ALL_NEW",
    };

    console.log("DynamoDB Update Params:", params);

    // DynamoDB에 업데이트 수행
    const data = await ddbClient.send(new UpdateItemCommand(params));

    // 응답 데이터를 Boolean으로 변환
    const updatedPost = {
      resolved: data.Attributes?.resolved?.S === "true", // String -> Boolean 변환
      updatedAt: data.Attributes?.updatedAt?.S,
    };

    return createResponse(200, {
      message: "Post resolved status updated successfully.",
      updatedPost,
    });
  } catch (error) {
    console.error("Error updating resolved status:", error);
    return createResponse(500, {
      message: "Internal server error",
      error: error.message,
    });
  }
};
