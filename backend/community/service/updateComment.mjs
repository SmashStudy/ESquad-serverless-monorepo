import {
  DynamoDBClient,
  GetItemCommand,
  UpdateItemCommand,
} from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({ region: process.env.REGION });

export const handler = async (event) => {
  try {
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { commentId, content, userEmail } = body;
    const { boardType, postId } = event.pathParameters;
    const createdAt = event.queryStringParameters?.createdAt;

    // 필수 매개변수 확인
    if (!commentId || !content || !userEmail || !postId || !createdAt) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message:
            "Missing required parameters: commentId, content, userEmail, postId, or createdAt",
        }),
      };
    }

    // 유효한 게시판 타입 확인
    const validBoardTypes = ["general", "questions", "team-recruit"];
    if (!validBoardTypes.includes(boardType)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid boardType" }),
      };
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
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Post not found" }),
      };
    }

    const comments = data.Item.comments?.L || [];

    // 댓글 찾기
    const commentIndex = comments.findIndex(
      (comment) => comment.M.id.S === commentId
    );

    if (commentIndex === -1) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Comment not found" }),
      };
    }

    // 댓글 작성자 확인
    const comment = comments[commentIndex].M;
    const commentWriterEmail = comment.writer.M.email.S;

    if (commentWriterEmail !== userEmail) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          message: "You are not authorized to update this comment",
        }),
      };
    }

    // 댓글 수정
    const updatedComment = {
      ...comment,
      content: { S: content },
      updatedAt: { S: new Date().toISOString() },
    };

    comments[commentIndex] = { M: updatedComment };

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

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Comment updated successfully",
        updatedComment,
      }),
    };
  } catch (error) {
    console.error("Error updating comment:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
        error: error.message,
      }),
    };
  }
};
