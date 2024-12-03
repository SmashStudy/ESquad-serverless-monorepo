import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { createResponse } from "../util/responseHelper.mjs";

const ddbClient = new DynamoDBClient({ region: process.env.REGION });

export const handler = async (event) => {
  try {
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { title, content, writer, book, tags = [], images = [] } = body;
    const boardType = event.pathParameters.boardType;

    const validBoardTypes = ["general", "questions", "team-recruit"];
    if (!validBoardTypes.includes(boardType)) {
      return createResponse(400, { message: "Invalid boardType" });
    }

    if (!title || !content || !writer) {
      return createResponse(400, { message: "Missing required fields" });
    }

    const postId = uuidv4();
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;
    const likedUsers = [];

    const item = {
      PK: { S: `POST#${postId}` },
      SK: { S: createdAt },
      boardType: { S: boardType },
      title: { S: title },
      content: { S: content },
      writer: {
        M: {
          name: { S: writer.name },
          nickname: { S: writer.nickname },
          email: { S: writer.email },
        },
      },
      book: book
        ? {
            M: {
              bookId: { S: book.bookId },
              title: { S: book.title },
              author: { S: book.author },
              isbn: { S: book.isbn },
            },
          }
        : { NULL: true },
      ...(tags.length > 0 && { tags: { SS: tags } }),
      ...(images.length > 0 && {
        images: {
          L: images.map((image) => ({
            M: {
              key: { S: image.key },
              url: { S: image.url },
            },
          })),
        },
      }), // 이미지 리스트 추가
      createdAt: { S: createdAt },
      updatedAt: { S: updatedAt },
      viewCount: { N: "0" },
      likeCount: { N: "0" },
      ...(likedUsers.length > 0 && { likedUsers: { SS: likedUsers } }),
      ...(boardType === "questions" && { resolved: { S: "false" } }),
      ...(boardType === "team-recruit" && { recruitStatus: { S: "false" } }),
      comments: { L: [] },
    };

    const command = new PutItemCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Item: item,
    });

    await ddbClient.send(command);

    return createResponse(201, {
      message: "Post created successfully",
      postId: postId,
      boardType: boardType,
      createdAt: createdAt,
    });
  } catch (error) {
    console.error("Error creating post:", error);
    return createResponse(500, {
      message: "Internal server error",
      error: error.message,
    });
  }
};
