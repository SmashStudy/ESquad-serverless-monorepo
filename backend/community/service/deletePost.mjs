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
      // 기존 코드:
      // return {
      //   statusCode: 400,
      //   body: JSON.stringify({
      //     message: "Missing required parameters: postId or createdAt",
      //   }),
      // };
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
    // 기존 코드:
    // return {
    //   statusCode: 200,
    //   body: JSON.stringify({
    //     message: "Post deleted successfully",
    //     postId: postId,
    //   }),
    //   headers: {
    //     "Access-Control-Allow-Origin": "*",
    //   },
    // };
  } catch (error) {
    console.error("Error deleting post:", error);
    return createResponse(500, {
      message: "Internal server error",
      error: error.message,
    });
    // 기존 코드:
    // return {
    //   statusCode: 500,
    //   body: JSON.stringify({
    //     message: "Internal server error",
    //     error: error.message,
    //   }),
    //   headers: {
    //     "Content-Type": "application/json",
    //     "Access-Control-Allow-Origin": "*",
    //   },
    // };
  }
};
