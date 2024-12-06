import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { createResponse } from "../utils/responseHelper.mjs";

const ddbClient = new DynamoDBClient({ region: process.env.REGION });

export const handler = async (event) => {
  try {
    const { postId } = event.pathParameters;
    const { createdAt } = event.queryStringParameters;
    const { resolved, recruitStatus } = JSON.parse(event.body); // resolved, recruitStatus 모두 받음
    const { boardType } = event.queryStringParameters; // boardType 추가 확인

    // 필수 파라미터 검증
    if (!postId || !createdAt || !boardType) {
      return createResponse(400, {
        message: "Missing required parameters: postId, createdAt, or boardType",
      });
    }

    let updateField, currentValue, updatedValue;

    if (boardType === "team-recruit") {
      // 스터디 모집 게시판의 경우 recruitStatus 업데이트
      if (recruitStatus === undefined) {
        return createResponse(400, {
          message: "The recruitStatus field is required for team-recruit.",
        });
      }
      updateField = "recruitStatus";
      currentValue = recruitStatus;
      updatedValue = !recruitStatus;
    } else {
      // 다른 게시판 (예: 질문 게시판)의 경우 resolved 업데이트
      if (resolved === undefined) {
        return createResponse(400, {
          message: "The resolved field is required for this board type.",
        });
      }
      updateField = "resolved";
      currentValue = resolved;
      updatedValue = !resolved;
    }

    // DynamoDB UpdateItemCommand 파라미터 정의
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
        ":updatedValue": { S: updatedValue.toString() }, // Boolean -> String 변환
        ":updatedAt": { S: new Date().toISOString() },
      },
      ReturnValues: "ALL_NEW",
    };

    console.log("DynamoDB Update Params:", params);

    // DynamoDB에 업데이트 수행
    const data = await ddbClient.send(new UpdateItemCommand(params));

    // 응답 데이터 처리
    const updatedPost = {
      [updateField]: data.Attributes?.[updateField]?.S === "true", // String -> Boolean 변환
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
