import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { createResponse } from "../util/responseHelper.mjs";

const ddbClient = new DynamoDBClient({ region: process.env.REGION });

const convertDynamoDBItem = (item) => {
  const convertedItem = {};
  for (const key in item) {
    if (item[key].S) {
      convertedItem[key] = item[key].S;
    } else if (item[key].N) {
      convertedItem[key] = parseInt(item[key].N, 10);
    } else if (item[key].BOOL !== undefined) {
      convertedItem[key] = item[key].BOOL;
    } else if (item[key].SS) {
      convertedItem[key] = item[key].SS;
    } else if (item[key].M) {
      convertedItem[key] = convertDynamoDBItem(item[key].M);
    }
  }
  return convertedItem;
};

export const handler = async (event) => {
  try {
    const postId = event.pathParameters.postId;
    const createdAt = event.queryStringParameters?.createdAt;

    const { title, content, resolved, tags } = JSON.parse(event.body);

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

    const updateExpressionParts = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {
      "#updatedAt": "updatedAt",
    };

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
      updateExpressionParts.push("#tags = :tags");
      expressionAttributeValues[":tags"] = { SS: tags || [] };
      expressionAttributeNames["#tags"] = "tags";
    }

    updateExpressionParts.push("#updatedAt = :updatedAt");
    expressionAttributeValues[":updatedAt"] = { S: new Date().toISOString() };

    const updateExpression = "set " + updateExpressionParts.join(", ");

    const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: { S: `POST#${postId}` },
        SK: { S: createdAt },
      },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };

    console.log("DynamoDB Update Params:", params);

    const data = await ddbClient.send(new UpdateItemCommand(params));

    const updatedPost = convertDynamoDBItem(data.Attributes);

    return createResponse(200, {
      message: "Post updated successfully",
      updatedPost,
    });
  } catch (error) {
    console.error("Error updating post:", error);
    return createResponse(500, {
      message: "Internal server error",
      error: error.message,
    });
  }
};
