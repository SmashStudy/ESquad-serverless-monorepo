import {
  DynamoDBClient,
  DeleteItemCommand,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createResponse } from "../utils/responseHelper.mjs";

const ddbClient = new DynamoDBClient({ region: process.env.REGION });
const s3Client = new S3Client({ region: process.env.REGION });

export const handler = async (event) => {
  try {
    const postId = event.pathParameters.postId;
    const createdAt = event.queryStringParameters?.createdAt;

    if (!postId || !createdAt) {
      return createResponse(400, {
        message: "Missing required parameters: postId or createdAt",
      });
    }

    // 1. 게시글 조회
    const getItemParams = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: { S: `POST#${postId}` },
        SK: { S: createdAt },
      },
    };

    const { Item } = await ddbClient.send(new GetItemCommand(getItemParams));

    if (!Item) {
      return createResponse(404, {
        message: "Post not found",
      });
    }

    // 2. content에서 이미지 URL 추출
    const content = Item.content?.S || "";
    const imageUrls = [];
    content.replace(/<img\s+src="https:\/\/[^\s"]+"/g, (match) => {
      const url = match.match(/src="([^"]+)"/)[1];
      imageUrls.push(url);
      return match;
    });

    console.log("Extracted Image URLs:", imageUrls);

    // 3. S3에서 이미지 삭제
    const deleteImagePromises = imageUrls.map((url) => {
      const key = url.split("/").slice(-2).join("/"); // S3 키 추출
      if (!process.env.S3_BUCKET) {
        throw new Error("S3_BUCKET environment variable is not defined.");
      }
      return s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: key,
        })
      );
    });

    await Promise.all(deleteImagePromises);

    // 4. DynamoDB에서 게시글 삭제
    const deleteParams = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: { S: `POST#${postId}` },
        SK: { S: createdAt },
      },
    };

    await ddbClient.send(new DeleteItemCommand(deleteParams));

    return createResponse(200, {
      message: "Post and associated images deleted successfully",
      postId: postId,
    });
  } catch (error) {
    console.error("Error deleting post:", error);
    return createResponse(500, {
      message: "Internal server error",
      error: error.message,
    });
  }
};
