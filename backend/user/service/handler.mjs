import {
  DynamoDBClient,
  PutItemCommand,
  UpdateItemCommand,
  GetItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { createResponse } from "../util/responseHelper.mjs";

const dynamoDb = new DynamoDBClient({ region: process.env.REGION || "us-east-1" });

// 사용자 정보를 저장하는 함수
export const saveUserToDynamoDB = async (event) => {
  try {
    const userAttributes = event.request.userAttributes;

    if (!userAttributes.email) {
      return createResponse(400, { error: "사용자 속성에 이메일이 없습니다" });
    }

    const email = userAttributes.email;
    const nickname = userAttributes.nickname || `${email.split("@")[0]}`; // 기본 닉네임 설정

    const params = {
      TableName: process.env.USER_TABLE_NAME || "esquad-table-user-dev",
      Item: {
        email: { S: email },
        name: {
          S: userAttributes.name || `${userAttributes.given_name || ""} ${userAttributes.family_name || ""}`.trim(),
        },
        nickname: { S: nickname },
        createdAt: { S: new Date().toISOString() },
      },
    };

    const command = new PutItemCommand(params);
    await dynamoDb.send(command);

    console.log("사용자가 DynamoDB에 저장되었습니다:", params.Item);

    return createResponse(200, { message: "사용자가 성공적으로 저장되었습니다" });
  } catch (error) {
    console.error("DynamoDB에 사용자 저장 중 오류 발생:", error);
    return createResponse(500, { error: "사용자 저장 중 오류 발생", message: error.message });
  }
};

// 닉네임 가져오기 함수
export const getUserNickname = async (event) => {
  try {
    const authHeader = event.headers?.Authorization;
    if (!authHeader) {
      return createResponse(401, { error: "Authorization 헤더가 없습니다" });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) {
      return createResponse(401, { error: "JWT 토큰이 Authorization 헤더에 없습니다" });
    }

    const decoded = jwt.decode(token);
    if (!decoded?.email) {
      return createResponse(400, { error: "JWT 토큰에 email 속성이 없습니다" });
    }

    const email = String(decoded.email);
    console.log(`email: ${email}`);

    const params = {
      TableName: process.env.USER_TABLE_NAME || "esquad-table-user-dev",
      Key: { email: { S: email } },
    };

    const command = new GetItemCommand(params);
    const user = await dynamoDb.send(command);

    if (!user.Item) {
      return createResponse(404, { error: "사용자를 찾을 수 없습니다" });
    }

    const nickname = user.Item.nickname?.S || null;
    if (!nickname) {
      return createResponse(404, { error: "사용자 닉네임이 없습니다" });
    }

    return createResponse(200, { nickname });
  } catch (error) {
    console.error("닉네임 가져오기 중 오류 발생:", error);
    return createResponse(500, { error: "닉네임 가져오기 중 오류 발생", message: error.message });
  }
};

// 환경 변수 가져오기
export const myEnvironments = async () => {
  try {
    const envKeys = [
      "VITE_COGNITO_CLIENT_ID",
      "VITE_COGNITO_REDIRECT_URI",
      "VITE_COGNITO_LOGOUT_URI",
      "VITE_COGNITO_DOMAIN",
      "VITE_COGNITO_SCOPE",
      "VITE_COGNITO_RESPONSE_TYPE",
    ];

    const envVariables = envKeys.reduce((acc, key) => {
      if (process.env[key]) {
        acc[key] = process.env[key];
      }
      return acc;
    }, {});

    return createResponse(200, envVariables);
  } catch (error) {
    console.error("환경 변수 반환 중 오류 발생:", error);
    return createResponse(500, { error: "환경 변수 반환 중 오류 발생", message: error.message });
  }
};

// 닉네임 업데이트 함수
export const updateUserNickname = async (event) => {
  try {
    const authHeader = event.headers?.Authorization;
    if (!authHeader) {
      return createResponse(401, { error: "Authorization 헤더가 없습니다" });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) {
      return createResponse(401, { error: "JWT 토큰이 Authorization 헤더에 없습니다" });
    }

    const decoded = jwt.decode(token);
    if (!decoded?.email) {
      return createResponse(400, { error: "JWT 토큰에 email 속성이 없습니다" });
    }

    const email = String(decoded.email);
    console.log(`email: ${email}`);

    const body = JSON.parse(event.body);
    if (!body?.nickname) {
      return createResponse(400, { error: "닉네임이 요청 본문에 없습니다" });
    }

    const newNickname = String(body.nickname).trim();

    if (newNickname.length < 2 || newNickname.length > 10) {
      return createResponse(400, { error: "닉네임은 2자 이상, 10자 이하여야 합니다" });
    }

    const scanParams = {
      TableName: process.env.USER_TABLE_NAME || "esquad-table-user-dev",
      FilterExpression: "nickname = :nickname",
      ExpressionAttributeValues: {
        ":nickname": { S: newNickname },
      },
    };

    const scanCommand = new ScanCommand(scanParams);
    const scanResult = await dynamoDb.send(scanCommand);
    if (scanResult.Count > 0) {
      return createResponse(409, { error: "이미 사용 중인 닉네임입니다" });
    }

    const params = {
      TableName: process.env.USER_TABLE_NAME || "esquad-table-user-dev",
      Key: { email: { S: email } },
      UpdateExpression: "SET nickname = :nickname",
      ExpressionAttributeValues: {
        ":nickname": { S: newNickname },
      },
      ReturnValues: "UPDATED_NEW",
    };

    const command = new UpdateItemCommand(params);
    await dynamoDb.send(command);

    return createResponse(200, {
      message: "닉네임이 성공적으로 업데이트되었습니다",
      nickname: newNickname,
    });
  } catch (error) {
    console.error("닉네임 업데이트 중 오류 발생:", error);
    return createResponse(500, { error: "닉네임 업데이트 중 오류 발생", message: error.message });
  }
};

// 이메일로 유저 정보를 가져오는 함수
export const getUserByEmail = async (event) => {
  try {
    console.log("Received event:", event); // 디버깅용 로그 추가

    // 이벤트에서 이메일 추출
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    const email = body?.email;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return createResponse(400, { error: "유효한 이메일이 제공되지 않았습니다" });
    }

    const params = {
      TableName: process.env.USER_TABLE_NAME || "esquad-table-user-dev",
      Key: {
        email: { S: email },
      },
    };

    const command = new GetItemCommand(params);
    const result = await dynamoDb.send(command);

    if (!result.Item) {
      return createResponse(404, { error: "사용자를 찾을 수 없습니다" });
    }

    // DynamoDB의 결과를 JavaScript 객체로 변환
    const user = {
      email: result.Item.email.S,
      name: result.Item.name?.S || null,
      nickname: result.Item.nickname?.S || null,
      createdAt: result.Item.createdAt?.S || null,
    };

    console.log("사용자 정보 가져오기 성공:", user);

    return createResponse(200, user);
  } catch (error) {
    console.error("이메일로 사용자 정보 가져오기 중 오류 발생:", error.message, "\nStack:", error.stack);
    return createResponse(500, { error: "이메일로 사용자 정보 가져오기 중 오류 발생", message: error.message });
  }
};

// 토큰에서 이메일을 추출하여 유저 정보 가져오기
export const getUserInfoByToken = async (event) => {
  try {
    const authHeader = event.headers?.Authorization;
    if (!authHeader) {
      return createResponse(401, { error: "Authorization 헤더가 없습니다" });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) {
      return createResponse(401, { error: "JWT 토큰이 Authorization 헤더에 없습니다" });
    }

    const decoded = jwt.decode(token);
    if (!decoded?.email) {
      return createResponse(400, { error: "JWT 토큰에 email 속성이 없습니다" });
    }

    const email = String(decoded.email);
    console.log(`토큰에서 추출한 이메일: ${email}`);

    const params = {
      TableName: process.env.USER_TABLE_NAME || "esquad-table-user-dev",
      Key: {
        email: { S: email },
      },
    };

    const command = new GetItemCommand(params);
    const result = await dynamoDb.send(command);

    if (!result.Item) {
      return createResponse(404, { error: "해당 이메일로 사용자를 찾을 수 없습니다" });
    }

    // 결과를 객체로 변환
    const user = {
      email: result.Item.email.S,
      name: result.Item.name?.S || null,
      nickname: result.Item.nickname?.S || null,
      createdAt: result.Item.createdAt?.S || null,
    };

    console.log("해당 이메일의 사용자 정보:", user);

    return createResponse(200, user);
  } catch (error) {
    console.error("토큰에서 이메일로 사용자 정보 가져오기 중 오류 발생:", error.message, "\nStack:", error.stack);
    return createResponse(500, { error: "토큰에서 이메일로 사용자 정보 가져오기 중 오류 발생", message: error.message });
  }
};

// JWT에서 이메일 가져오기 함수
export const getEmailFromToken = async (event) => {
  try {
    const authHeader = event.headers?.Authorization;
    if (!authHeader) {
      return createResponse(401, { error: "Authorization 헤더가 없습니다" });
    }

    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;
    if (!token) {
      return createResponse(401, { error: "JWT 토큰이 Authorization 헤더에 없습니다" });
    }

    const decoded = jwt.decode(token);
    if (!decoded?.email) {
      return createResponse(400, { error: "JWT 토큰에 email 속성이 없습니다" });
    }

    const email = String(decoded.email);

    return createResponse(200, { email });
  } catch (error) {
    console.error("JWT에서 이메일 가져오기 중 오류 발생:", error);
    return createResponse(500, { error: "JWT에서 이메일 가져오기 중 오류 발생", message: error.message });
  }
};
