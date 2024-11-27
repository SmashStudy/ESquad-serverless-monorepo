import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";

const ddbClient = new DynamoDBClient({ region: process.env.REGION });

export const handler = async (event) => {
  try {
    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { content, writer } = body;
    const { boardType, postId } = event.pathParameters;
    const createdAt = event.queryStringParameters?.createdAt;

    if (!createdAt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing createdAt query parameter" }),
      };
    }

    const validBoardTypes = ["general", "questions", "team-recruit"];
    if (!validBoardTypes.includes(boardType)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid boardType" }),
      };
    }

    if (
      !content ||
      !writer ||
      !writer.name ||
      !writer.nickname ||
      !writer.email
    ) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Missing required fields" }),
      };
    }

    const commentId = uuidv4();
    const commentCreatedAt = new Date().toISOString();

    const newComment = {
      id: commentId,
      content: content,
      writer: {
        name: writer.name,
        nickname: writer.nickname,
        email: writer.email,
      },
      createdAt: commentCreatedAt,
      updatedAt: commentCreatedAt,
      likeCount: 0,
    };

    // DynamoDB 업데이트 명령
    const command = new UpdateItemCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: { S: `POST#${postId}` },
        SK: { S: createdAt },
      },
      UpdateExpression:
        "SET #comments = list_append(if_not_exists(#comments, :empty_list), :new_comment)",
      ExpressionAttributeNames: {
        "#comments": "comments",
      },
      ExpressionAttributeValues: {
        ":empty_list": { L: [] }, // 빈 리스트 초기화
        ":new_comment": {
          L: [
            {
              M: {
                id: { S: commentId },
                content: { S: content },
                writer: {
                  M: {
                    name: { S: writer.name },
                    nickname: { S: writer.nickname },
                    email: { S: writer.email },
                  },
                },
                createdAt: { S: commentCreatedAt },
                updatedAt: { S: commentCreatedAt },
                likeCount: { N: "0" },
              },
            },
          ],
        },
      },
      ReturnValues: "UPDATED_NEW",
    });

    const response = await ddbClient.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Comment added successfully",
        commentId: commentId,
      }),
    };
  } catch (error) {
    console.error("Error adding comment:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
        error: error.message,
      }),
    };
  }
};
