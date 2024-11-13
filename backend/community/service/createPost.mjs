import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

const ddbClient = new DynamoDBClient({ region: process.env.REGION });

export const handler = async (event) => {
  try {
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { title, content, writer, book, tags } = body;
    const boardType = event.pathParameters.boardType;

    const validBoardTypes = ["general", "questions", "team-recruit"];
    if (!validBoardTypes.includes(boardType)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid boardType" }),
      };
    }

    if (!title || !content || !writer) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    const postId = uuidv4();
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    const item = {
      PK: { S: `POST#${postId}` },
      SK: { S: createdAt },
      boardType: { S: boardType },
      title: { S: title },
      content: { S: content },
      writer: {
        M: {
          id: { S: writer.id },
          name: { S: writer.name },
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
      tags: { SS: tags || [] },
      createdAt: { S: createdAt },
      updatedAt: { S: updatedAt },
      viewCount: { N: "0" },
      likeCount: { N: "0" },
      resolved: { BOOL: false },
    };

    const command = new PutItemCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Item: item,
    });

    await ddbClient.send(command);

    return {
      statusCode: 201,
      body: JSON.stringify({
        message: "Post created successfully",
        postId: postId,
        boardType: boardType,
        createdAt: createdAt,
      }),
    };
  } catch (error) {
    console.error("Error creating post:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
        error: error.message,
      }),
    };
  }
};
