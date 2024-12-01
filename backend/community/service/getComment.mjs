import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { createResponse } from "../util/responseHelper.mjs";

const ddbClient = new DynamoDBClient({ region: process.env.REGION });

export const handler = async (event) => {
  try {
    const postId = event.pathParameters.postId;
    const commentId = event.pathParameters.commentId; // 특정 댓글 ID
    const createdAt = event.queryStringParameters?.createdAt;

    // 필수 매개변수 확인
    if (!postId || !createdAt || !commentId) {
      return createResponse(400, {
        message: "Missing required parameters: postId, createdAt, or commentId",
      });
    }

    const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: { S: `POST#${postId}` },
        SK: { S: createdAt },
      },
      ProjectionExpression: "comments",
    };

    const data = await ddbClient.send(new GetItemCommand(params));

    if (!data.Item) {
      return createResponse(404, { message: "Post not found" });
    }

    // 댓글 데이터 파싱
    const comments = data.Item.comments?.L || [];
    const comment = comments.find(
      (c) => c.M.id.S === commentId // 특정 댓글 찾기
    );

    if (!comment) {
      return createResponse(404, { message: "Comment not found" });
    }

    const result = {
      id: comment.M.id.S,
      content: comment.M.content.S,
      writer: {
        email: comment.M.writer.M.email.S,
        name: comment.M.writer.M.name.S,
        nickname: comment.M.writer.M.nickname.S,
      },
      createdAt: comment.M.createdAt.S,
      updatedAt: comment.M.updatedAt.S,
      likeCount: comment.M.likeCount ? parseInt(comment.M.likeCount.N, 10) : 0,
    };

    return createResponse(200, {
      message: "Comment retrieved successfully",
      comment: result,
    });
  } catch (error) {
    console.error("Error fetching comment:", error);
    return createResponse(500, {
      message: "Internal server error",
      error: error.message,
    });
  }
};
