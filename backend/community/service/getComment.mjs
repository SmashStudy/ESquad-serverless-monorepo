import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { createResponse } from "../util/responseHelper.mjs";

const ddbClient = new DynamoDBClient({ region: process.env.REGION });

export const handler = async (event) => {
  try {
    const postId = event.pathParameters.postId;
    const createdAt = event.queryStringParameters?.createdAt;

    // 필수 매개변수 확인
    if (!postId || !createdAt) {
      return createResponse(400, {
        message: "Missing required parameters: postId or createdAt",
      });
      // 기존 코드:
      // return {
      //   statusCode: 400,
      //   body: JSON.stringify({
      //     message: "Missing required parameters: postId or createdAt",
      //   }),
      // };
    }

    const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: { S: `POST#${postId}` },
        SK: { S: createdAt },
      },
      ProjectionExpression: "comments",
    };

    console.log("DynamoDB Query Params:", params);

    const data = await ddbClient.send(new GetItemCommand(params));

    // 게시글이 없을 경우
    if (!data.Item) {
      return createResponse(404, { message: "Post not found" });
      // 기존 코드:
      // return {
      //   statusCode: 404,
      //   body: JSON.stringify({ message: "Post not found" }),
      // };
    }

    // 댓글 데이터 파싱
    const comments =
      data.Item.comments?.L.map((comment) => ({
        id: comment.M.id.S,
        content: comment.M.content.S,
        writer: {
          email: comment.M.writer.M.email.S,
          name: comment.M.writer.M.name.S,
          nickname: comment.M.writer.M.nickname.S,
        },
        createdAt: comment.M.createdAt.S,
        updatedAt: comment.M.updatedAt.S,
        likeCount: comment.M.likeCount
          ? parseInt(comment.M.likeCount.N, 10)
          : 0, // 좋아요 수
      })) || [];

    return createResponse(200, {
      message: "Comments retrieved successfully",
      comments: comments,
    });
    // 기존 코드:
    // return {
    //   statusCode: 200,
    //   body: JSON.stringify({
    //     message: "Comments retrieved successfully",
    //     comments: comments,
    //   }),
    // };
  } catch (error) {
    console.error("Error fetching comments:", error);
    return createResponse(500, {
      message: "Internal server error",
      error: error.message,
    });
    // 기존 코드:
    // return {
    //   statusCode: 500,
    //   body: JSON.stringify({
    //     message: "Internal server error",
    //     error: error.message,
    //   }),
    // };
  }
};
