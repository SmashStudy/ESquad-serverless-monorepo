import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({ region: process.env.REGION });

export const handler = async (event) => {
  try {
    const postId = event.pathParameters.postId;
    const createdAt = event.queryStringParameters?.createdAt;

    if (!postId || !createdAt) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: "Missing required parameters: postId or createdAt",
        }),
      };
    }

    const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: { S: `POST#${postId}` },
        SK: { S: createdAt },
      },
    };

    console.log("DynamoDB Query Params:", params);

    const data = await ddbClient.send(new GetItemCommand(params));

    if (!data.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Post not found" }),
      };
    }

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
      viewCount: parseInt(data.Item.viewCount.N, 10),
      likeCount: parseInt(data.Item.likeCount.N, 10),
      resolved:
        data.Item.boardType.S === "questions"
          ? data.Item.resolved?.BOOL
          : undefined,
      recruitStatus:
        data.Item.boardType.S === "team-recruit"
          ? data.Item.recruitStatus?.BOOL
          : undefined,
    };

    return {
      statusCode: 200,
      body: JSON.stringify(post),
    };
  } catch (error) {
    console.error("Error fetching post:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
        error: error.message,
      }),
    };
  }
};
