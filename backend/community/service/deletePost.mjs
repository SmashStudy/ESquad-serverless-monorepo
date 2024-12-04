import {
  DynamoDBClient,
  DeleteItemCommand,
  GetItemCommand,
} from "@aws-sdk/client-dynamodb";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { createResponse } from "../util/responseHelper.mjs";

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

    const getItemParams = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: { S: `POST#${postId}` },
        SK: { S: createdAt },
      },
    };

    const getItemCommand = new GetItemCommand(getItemParams);
    const { Item } = await ddbClient.send(getItemCommand);

    if (!Item) {
      return createResponse(404, {
        message: "Post not found",
      });
    }

    const content = Item.content?.S || "";
    const imageUrls = [];
    content.replace(/<img\s+src="https:\/\/[^\s"]+"/g, (match) => {
      const url = match.match(/src="([^"]+)"/)[1];
      imageUrls.push(url);
      return match;
    });

    const deleteImagePromises = imageUrls.map((url) => {
      const key = url.split("/").slice(-2).join("/");
      return s3Client.send(
        new DeleteObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: key,
        })
      );
    });

    await Promise.all(deleteImagePromises);

    const deleteParams = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: { S: `POST#${postId}` },
        SK: { S: createdAt },
      },
    };

    console.log("DynamoDB Delete Params:", deleteParams);

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
