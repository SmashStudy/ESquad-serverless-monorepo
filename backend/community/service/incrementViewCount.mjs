import {
  DynamoDBClient,
  UpdateItemCommand,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { createResponse } from "../util/responseHelper.mjs";

const ddbClient = new DynamoDBClient({ region: process.env.REGION });

export const handler = async (event) => {
  try {
    const postId = event.pathParameters.postId;
    const createdAt = event.queryStringParameters?.createdAt;

    if (!postId || !createdAt) {
      return createResponse(400, {
        message: "Missing required parameters: postId or createdAt",
      });
    }

    // 먼저 항목을 조회하여 존재 여부 확인
    const getParams = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: { S: `POST#${postId}` },
        SK: { S: createdAt },
      },
    };

    console.log("DynamoDB GetItem Params:", getParams);

    const data = await ddbClient.send(new GetItemCommand(getParams));

    if (!data.Item) {
      return createResponse(404, { message: "Post not found" });
    }

    // 조회수(viewCount)를 1 증가시키기 위해 UpdateItemCommand 사용
    const updateParams = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: { S: `POST#${postId}` },
        SK: { S: createdAt },
      },
      UpdateExpression: "ADD viewCount :inc",
      ExpressionAttributeValues: {
        ":inc": { N: "1" },
      },
      ReturnValues: "UPDATED_NEW",
    };

    console.log("DynamoDB UpdateItem Params:", updateParams);

    const updatedData = await ddbClient.send(
      new UpdateItemCommand(updateParams)
    );

    return createResponse(200, {
      postId,
      createdAt,
      viewCount: parseInt(updatedData.Attributes.viewCount.N, 10),
    });
  } catch (error) {
    console.error("Error updating view count:", error);
    return createResponse(500, {
      message: "Internal server error",
      error: error.message,
    });
  }
};
