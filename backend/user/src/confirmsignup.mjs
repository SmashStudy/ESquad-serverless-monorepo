// src/handlers/confirm.js
import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { createResponse } from "../util/responseHelper.mjs"; // createResponse 함수 가져오기

const client = new CognitoIdentityProviderClient({
  region: process.env.REGION,
});

export const handler = async (event) => {
  try {
    const { email, code } = JSON.parse(event.body);

    // ConfirmSignUpCommand 생성
    const command = new ConfirmSignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
    });

    // Cognito로 요청 전송
    const response = await client.send(command);

    // 성공 응답
    return createResponse(200, {
      message: "사용자가 성공적으로 확인되었습니다",
      response,
    });
  } catch (error) {
    console.error("회원가입 확인 중 오류:", error);

    // 에러 응답
    return createResponse(500, {
      message: "회원가입 확인 중 오류가 발생했습니다",
      error: error.message,
    });
  }
};
