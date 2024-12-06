import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { createResponse } from "../utils/responseHelper.mjs";

const ddbClient = new DynamoDBClient({ region: process.env.REGION });

export const handler = async (event) => {
  try {
    const { postId } = event.pathParameters;
    const { createdAt, boardType } = event.queryStringParameters;
    const body = JSON.parse(event.body);

    // 필수 파라미터 검증
    if (!postId || !createdAt || !boardType) {
      return createResponse(400, {
        message: "Missing required parameters: postId, createdAt, or boardType",
      });
    }

    let updateField = null;
    let currentValue = null;

    if (boardType === "questions") {
      // 질문 게시판의 경우 resolved 처리
      if (body.resolved === undefined) {
        return createResponse(400, {
          message: "The resolved field is required for questions board type.",
        });
      }
      updateField = "resolved";
      currentValue = body.resolved;
    } else if (boardType === "team-recruit") {
      // 팀 모집 게시판의 경우 recruitStatus 처리
      if (body.recruitStatus === undefined) {
        return createResponse(400, {
          message:
            "The recruitStatus field is required for team-recruit board type.",
        });
      }
      updateField = "recruitStatus";
      currentValue = body.recruitStatus;
    } else {
      return createResponse(400, {
        message: `Invalid boardType: ${boardType}. Supported types are questions or team-recruit.`,
      });
    }

    const updatedValue = !currentValue;

    const params = {
      TableName: process.env.DYNAMODB_TABLE,
      Key: {
        PK: { S: `POST#${postId}` },
        SK: { S: createdAt },
      },
      UpdateExpression: `SET #${updateField} = :updatedValue, #updatedAt = :updatedAt`,
      ExpressionAttributeNames: {
        [`#${updateField}`]: updateField,
        "#updatedAt": "updatedAt",
      },
      ExpressionAttributeValues: {
        ":updatedValue": { S: updatedValue.toString() },
        ":updatedAt": { S: new Date().toISOString() },
      },
      ReturnValues: "ALL_NEW",
    };

    console.log("DynamoDB Update Params:", params);

    // DynamoDB에 업데이트 수행
    const data = await ddbClient.send(new UpdateItemCommand(params));

    // 응답 데이터를 Boolean으로 변환
    const updatedPost = {
      [updateField]: data.Attributes?.[updateField]?.S === "true",
      updatedAt: data.Attributes?.updatedAt?.S,
    };

    return createResponse(200, {
      message: `Post ${updateField} status updated successfully.`,
      updatedPost,
    });
  } catch (error) {
    console.error("Error updating post status:", error);
    return createResponse(500, {
      message: "Internal server error",
      error: error.message,
    });
  }
};
