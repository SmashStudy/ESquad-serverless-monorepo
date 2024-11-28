import {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";
import { createResponse } from "../util/responseHelper.mjs";

const ddbClient = new DynamoDBClient({ region: process.env.REGION });

export const handler = async (event) => {
  try {
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { commentId, userEmail } = body;
    const { boardType, postId } = event.pathParameters;
    const createdAt = event.queryStringParameters?.createdAt;

    // 필수 매개변수 확인
    if (!commentId || !userEmail || !postId || !createdAt) {
      return createResponse(400, {
        message:
          "Missing required parameters: commentId, userEmail, postId, or createdAt",
      });
      // 기존 코드:
      // return {
      //   statusCode: 400,
      //   body: JSON.stringify({
      //     message:
      //       "Missing required parameters: commentId, userEmail, postId, or createdAt",
      //   }),
      // };
    }

    // 유효한 게시판 타입 확인
    const validBoardTypes = ["general", "questions", "team-recruit"];
    if (!validBoardTypes.includes(boardType)) {
      return createResponse(400, { message: "Invalid boardType" });
      // 기존 코드:
      // return {
      //   statusCode: 400,
      //   body: JSON.stringify({ message: "Invalid boardType" }),
      // };
    }

    // DynamoDB에서 댓글 데이터 가져오기
    const getParams = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: { S: `POST#${postId}` },
        SK: { S: createdAt },
      },
      ProjectionExpression: "comments",
    };

    const data = await ddbClient.send(new GetItemCommand(getParams));

    if (!data.Item) {
      return createResponse(404, { message: "Post not found" });
      // 기존 코드:
      // return {
      //   statusCode: 404,
      //   body: JSON.stringify({ message: "Post not found" }),
      // };
    }

    const comments = data.Item.comments?.L || [];

    // 댓글 찾기
    const commentIndex = comments.findIndex(
      (comment) => comment.M.id.S === commentId
    );

    if (commentIndex === -1) {
      return createResponse(404, { message: "Comment not found" });
      // 기존 코드:
      // return {
      //   statusCode: 404,
      //   body: JSON.stringify({ message: "Comment not found" }),
      // };
    }

    // 댓글 작성자 확인
    const comment = comments[commentIndex].M;
    const commentWriterEmail = comment.writer.M.email.S;

    if (commentWriterEmail !== userEmail) {
      return createResponse(403, {
        message: "You are not authorized to delete this comment",
      });
      // 기존 코드:
      // return {
      //   statusCode: 403,
      //   body: JSON.stringify({
      //     message: "You are not authorized to delete this comment",
      //   }),
      // };
    }

    // 댓글 삭제
    comments.splice(commentIndex, 1);

    // DynamoDB 업데이트 명령
    const updateParams = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: { S: `POST#${postId}` },
        SK: { S: createdAt },
      },
      UpdateExpression: "SET #comments = :comments",
      ExpressionAttributeNames: {
        "#comments": "comments",
      },
      ExpressionAttributeValues: {
        ":comments": { L: comments },
      },
      ReturnValues: "UPDATED_NEW",
    };

    const updateResponse = await ddbClient.send(
      new UpdateItemCommand(updateParams)
    );

    return createResponse(200, {
      message: "Comment deleted successfully",
      deletedCommentId: commentId,
    });
    // 기존 코드:
    // return {
    //   statusCode: 200,
    //   body: JSON.stringify({
    //     message: "Comment deleted successfully",
    //     deletedCommentId: commentId,
    //   }),
    // };
  } catch (error) {
    console.error("Error deleting comment:", error);
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
