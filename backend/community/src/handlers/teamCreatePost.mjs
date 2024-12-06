import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { createResponse } from "../utils/responseHelper.mjs";

const s3Client = new S3Client({ region: process.env.REGION });
const ddbClient = new DynamoDBClient({ region: process.env.REGION });

export const handler = async (event) => {
  try {
    console.log(`event is ${JSON.stringify(event, null, 2)}`);

    const body =
      typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const { title, content, writer, book, teamId, tags = [] } = body;
    console.log(
      `body: ${title}, ${content}, ${writer}, ${book}, ${teamId}, ${tags}`
    );

    if (!title || !content || !writer || !teamId) {
      return createResponse(400, { message: "Missing required fields" });
    }

    const postId = uuidv4();
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    // Extract Base64 images and replace in content
    const base64Images = [];
    const updatedContent = content.replace(
      /<img src="data:image\/(png|jpeg|jpg);base64,([^"]+)"/g,
      (match, type, data) => {
        const extension = type === "jpeg" ? "jpg" : type;
        const key = `uploads/${uuidv4()}.${extension}`;
        base64Images.push({ key, data, contentType: `image/${type}` });
        return `<img src="https://${process.env.S3_BUCKET}.s3.${process.env.REGION}.amazonaws.com/${key}" />`;
      }
    );

    console.log("Extracted Base64 Images:", base64Images);

    // Upload images to S3
    for (const image of base64Images) {
      const buffer = Buffer.from(image.data, "base64");
      const params = {
        Bucket: process.env.S3_BUCKET,
        Key: image.key,
        Body: buffer,
        ContentType: image.contentType,
      };
      await s3Client.send(new PutObjectCommand(params));
      console.log(`Image uploaded to S3: ${image.key}`);
    }

    // Prepare DynamoDB item
    const item = {
      PK: { S: `POST#${postId}` },
      SK: { S: createdAt },
      teamId: { S: teamId },
      boardType: { S: "questions" },
      title: { S: title },
      content: { S: updatedContent },
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
      createdAt: { S: createdAt },
      updatedAt: { S: updatedAt },
      viewCount: { N: "0" },
      likeCount: { N: "0" },
      resolved: { S: "false" },
      comments: { L: [] },
    };

    const command = new PutItemCommand({
      TableName: process.env.DYNAMODB_TABLE,
      Item: item,
    });

    // Insert into DynamoDB
    await ddbClient.send(command);

    console.log(`Post created successfully: ${postId}`);
    return createResponse(201, {
      message: "Post created successfully",
      postId: postId,
      teamId: teamId,
      boardType: "questions",
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
