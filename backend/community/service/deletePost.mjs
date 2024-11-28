import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { createResponse } from "../util/responseHelper.mjs";

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

    const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: { S: `POST#${postId}` },
        SK: { S: createdAt },
      },
    };

    console.log("DynamoDB Delete Params:", params);

    await ddbClient.send(new DeleteItemCommand(params));

    return createResponse(200, {
      message: "Post deleted successfully",
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
