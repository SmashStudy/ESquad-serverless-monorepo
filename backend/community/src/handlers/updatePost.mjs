import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { createResponse } from "../utils/responseHelper.mjs";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({ region: process.env.REGION });
const ddbClient = new DynamoDBClient({ region: process.env.REGION });

const uploadImageToS3 = async (fileName, base64Data) => {
  const buffer = Buffer.from(base64Data, "base64");
  const key = `uploads/${uuidv4()}-${fileName}`;
  const params = {
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: `image/${fileName.split(".").pop()}`,
  };

  await s3Client.send(new PutObjectCommand(params));
  return `https://${process.env.S3_BUCKET}.s3.${process.env.REGION}.amazonaws.com/${key}`;
};

export const handler = async (event) => {
  try {
    const postId = event.pathParameters.postId;
    const createdAt = event.queryStringParameters?.createdAt;
    let { title, content, resolved, tags } = JSON.parse(event.body);

    if (!postId || !createdAt) {
      return createResponse(400, {
        message: "Missing required parameters: postId or createdAt",
      });
    }

    if (!title && !content && !tags && resolved === undefined) {
      return createResponse(400, {
        message:
          "At least title, content, or tags must be provided for update.",
      });
    }

    // Base64 이미지 추출 및 변환
    const base64Images = [];
    content = content.replace(
      /<img\s+src="data:image\/(png|jpeg|jpg);base64,([^"]+)"[^>]*>/g,
      (match, type, data) => {
        const fileName = `${Date.now()}.${type}`;
        base64Images.push({ fileName, data });
        return `<img data-file="${fileName}" />`;
      }
    );

    const uploadedImages = await Promise.all(
      base64Images.map(({ fileName, data }) => uploadImageToS3(fileName, data))
    );

    uploadedImages.forEach((imageUrl, index) => {
      content = content.replace(
        `<img data-file="${base64Images[index].fileName}" />`,
        `<img src="${imageUrl}" />`
      );
    });

    // DynamoDB UpdateExpression 구성
    const updateExpressionParts = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = { "#updatedAt": "updatedAt" };

    if (title) {
      updateExpressionParts.push("#title = :title");
      expressionAttributeValues[":title"] = { S: title };
      expressionAttributeNames["#title"] = "title";
    }
    if (content) {
      updateExpressionParts.push("#content = :content");
      expressionAttributeValues[":content"] = { S: content };
      expressionAttributeNames["#content"] = "content";
    }
    if (resolved !== undefined) {
      updateExpressionParts.push("#resolved = :resolved");
      expressionAttributeValues[":resolved"] = { BOOL: resolved };
      expressionAttributeNames["#resolved"] = "resolved";
    }
    if (tags !== undefined) {
      if (tags.length > 0) {
        updateExpressionParts.push("#tags = :tags");
        expressionAttributeValues[":tags"] = { SS: tags };
        expressionAttributeNames["#tags"] = "tags";
      } else {
        updateExpressionParts.push("REMOVE #tags");
        expressionAttributeNames["#tags"] = "tags";
      }
    }

    updateExpressionParts.push("#updatedAt = :updatedAt");
    expressionAttributeValues[":updatedAt"] = { S: new Date().toISOString() };

    const updateExpression =
      "SET " +
      updateExpressionParts
        .filter((part) => !part.startsWith("REMOVE"))
        .join(", ");
    const removeExpression = updateExpressionParts
      .filter((part) => part.startsWith("REMOVE"))
      .join(", ");

    const finalUpdateExpression = removeExpression
      ? `${updateExpression} ${removeExpression}`
      : updateExpression;

    const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: { S: `POST#${postId}` },
        SK: { S: createdAt },
      },
      UpdateExpression: finalUpdateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };

    console.log("DynamoDB Update Params:", params);

    const data = await ddbClient.send(new UpdateItemCommand(params));

    return createResponse(200, {
      message: "Post updated successfully",
      updatedPost: data.Attributes,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return createResponse(500, {
      message: "Internal server error",
      error: error.message,
    });
  }
};
