import { dynamoDb, LOG_TABLE_NAME } from "./dynamoUtil.mjs";
import {PutCommand} from '@aws-sdk/lib-dynamodb';
import { createResponse } from "./responseHelper.mjs";
import { v4 as uuidv4 } from "uuid"; // UUID 생성 라이브러리


// 로그 데이터를 생성하여 DynamoDB에 저장하는 헬퍼 함수
export const sendLog = async (logData) => {
  try {
    // 유효성 검사
    if (!logData || !logData.action || !logData.fileKey || !logData.userEmail) {
      return createResponse(400, "필수 필드가 누락되었습니다.");
    }

    // DynamoDB에 저장할 로그 데이터 구성
    const item = {
      logId: uuidv4(),
      ...logData,
    };

    const params = {
      TableName: LOG_TABLE_NAME,
      Item: item,
    };

    const command = new PutCommand(params);

    // DynamoDB에 로그 데이터 저장
    await dynamoDb.send(command).promise();

    return createResponse(200, "로그가 정상적으로 저장되었습니다.");
  } catch (error) {
    console.error("로그 저장 중 오류 발생:", error);
    return createResponse(500, "로그 저장 중 오류가 발생했습니다.");
  }
};
