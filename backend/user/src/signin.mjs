import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { createCredentialResponse } from "../util/responseHelper.mjs";

const client = new CognitoIdentityProviderClient({
  region: process.env.REGION,
});

export const handler = async (event) => {
  const isProduction = process.env.NODE_ENV === "production";

  // OPTIONS 요청 처리
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "http://localhost:5173",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      body: "",
    };
  }

  try {
    // 필수 환경 변수 검증
    if (!process.env.REGION || !process.env.COGNITO_CLIENT_ID || !process.env.ALLOWED_ORIGIN) {
      throw new Error("필수 환경 변수가 설정되지 않았습니다.");
    }

    if (!event.body) {
      throw new Error("Request body is missing.");
    }

    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      throw new Error("필수 필드가 누락되었습니다: 이메일과 비밀번호를 입력해주세요.");
    }

    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.COGNITO_CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    const response = await client.send(command);
    const { AccessToken, IdToken, RefreshToken } = response.AuthenticationResult;

    const cookies = [
      `accessToken=${AccessToken}; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600`,
      `idToken=${IdToken}; HttpOnly; SameSite=Lax; Path=/; Max-Age=3600`,
      `refreshToken=${RefreshToken}; HttpOnly; SameSite=Lax; Path=/; Max-Age=2592000`,
    ];

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "http://localhost:5173",
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      multiValueHeaders: {
        "Set-Cookie": cookies,
      },
      body: JSON.stringify({ message: "Login successful" }),
    };
  } catch (error) {
    console.error("Signin error:", error);

    let errorMessage = "An unexpected error occurred.";
    if (error.name === "UserNotConfirmedException") {
      errorMessage = "사용자가 확인되지 않았습니다. 먼저 이메일을 확인해주세요.";
    } else if (error.name === "NotAuthorizedException") {
      errorMessage = "이메일 또는 비밀번호가 잘못되었습니다. 다시 시도해주세요.";
    } else if (error.name === "PasswordResetRequiredException") {
      errorMessage = "비밀번호 재설정이 필요합니다. 비밀번호를 재설정해주세요.";
    }

    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN || "http://localhost:5173",
        "Access-Control-Allow-Credentials": "true",
        "Content-Type": "application/json",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      body: JSON.stringify({ error: errorMessage }),
    };
  }
};
