import {
  DynamoDBClient,
  UpdateItemCommand,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { createResponse } from "../utils/responseHelper.mjs";

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

    // 1. 데이터 조회
    const getParams = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: { S: `POST#${postId}` },
        SK: { S: createdAt },
      },
    };

    const data = await ddbClient.send(new GetItemCommand(getParams));

    if (!data.Item) {
      return createResponse(404, { message: "Post not found" });
    }

    // 2. 조회수 증가
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

    const updatedData = await ddbClient.send(
      new UpdateItemCommand(updateParams)
    );

    // 3. 응답 데이터 생성
    const post = {
      postId: data.Item.PK.S.split("#")[1],
      boardType: data.Item.boardType.S,
      title: data.Item.title.S,
      content: data.Item.content.S,
      writer: {
        email: data.Item.writer.M.email.S,
        name: data.Item.writer.M.name.S,
        nickname: data.Item.writer.M.nickname.S,
      },
      book: data.Item.book?.M
        ? {
            bookId: data.Item.book.M.bookId.S,
            title: data.Item.book.M.title.S,
            author: data.Item.book.M.author.S,
            isbn: data.Item.book.M.isbn.S,
          }
        : null,
      tags: data.Item.tags?.SS || [],
      createdAt: data.Item.createdAt.S,
      updatedAt: data.Item.updatedAt.S,
      viewCount: parseInt(updatedData.Attributes.viewCount.N, 10), // 업데이트된 조회수 반영
      likeCount: parseInt(data.Item.likeCount.N, 10),
      likedUsers: data.Item.likedUsers?.SS || [],
      resolved:
        data.Item.boardType.S === "questions"
          ? data.Item.resolved?.S === "true"
          : undefined,
      recruitStatus:
        data.Item.boardType.S === "team-recruit"
          ? data.Item.recruitStatus?.S === "true"
          : undefined,
    };

    return createResponse(200, post);
  } catch (error) {
    console.error("Error fetching post and updating view count:", error);
    return createResponse(500, {
      message: "Internal server error",
      error: error.message,
    });
  }
};
