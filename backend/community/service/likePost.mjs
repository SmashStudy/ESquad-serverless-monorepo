import {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { createResponse } from "../util/responseHelper.mjs";

const client = new DynamoDBClient({ region: process.env.REGION });

export const handler = async (event) => {
  const { postId } = event.pathParameters;
  const createdAt = event.queryStringParameters?.createdAt;
  const userEmail = event.headers?.Authorization; 

  if (!postId || !createdAt || !userEmail) {
    return createResponse(400, {
      message: "Missing postId, createdAt, or userEmail in request",
    });
  }

  try {
    // 게시글 가져오기
    const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: { S: `POST#${postId}` },
        SK: { S: createdAt },
      },
    };

    console.log("DynamoDB Query Params:", params);

    const data = await client.send(new GetItemCommand(params));

    if (!data.Item) {
      return createResponse(404, { message: "Post not found" });
    }

    // 좋아요 여부 확인
    const likedUsers = data.Item.likedUsers ? data.Item.likedUsers.SS : [];
    const hasLiked = likedUsers.includes(userEmail);

    let updateExpression, expressionAttributeValues;

    if (hasLiked) {
      // 좋아요 취소
      updateExpression =
        "SET likeCount = likeCount - :decrement DELETE likedUsers :userEmail";
      expressionAttributeValues = {
        ":decrement": { N: "1" },
        ":userEmail": { SS: [userEmail] },
      };
    } else {
      // 좋아요 추가
      updateExpression =
        "SET likeCount = if_not_exists(likeCount, :start) + :increment ADD likedUsers :userEmail";
      expressionAttributeValues = {
        ":increment": { N: "1" },
        ":start": { N: "0" },
        ":userEmail": { SS: [userEmail] },
      };
    }

    // 좋아요 수 업데이트
    const updateParams = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: { S: `POST#${postId}` },
        SK: { S: createdAt },
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "UPDATED_NEW",
    };

    console.log("Update parameters:", updateParams);

    const response = await client.send(new UpdateItemCommand(updateParams));

    console.log("DynamoDB update response:", response);

    return createResponse(200, {
      message: hasLiked
        ? "Post unliked successfully"
        : "Post liked successfully",
      updatedAttributes: {
        likeCount: response.Attributes.likeCount.N,
      },
    });
  } catch (error) {
    console.error("Error liking post: ", error);
    return createResponse(500, {
      message: "An error occurred while liking the post",
      error: error.message,
    });
  }
};
