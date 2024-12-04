import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { createCredentialResponse } from "../util/responseHelper.mjs";

const client = new CognitoIdentityProviderClient({
  region: process.env.REGION,
});

export const handler = async (event) => {
  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === "OPTIONS") {
    return createCredentialResponse(200, ""); // OPTIONS 요청에 대한 빈 응답
  }

  try {
    if (!event.body) {
      throw new Error("Request body is missing.");
    }

    // 요청 본문 파싱
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      throw new Error("필수 필드가 누락되었습니다: 이메일과 비밀번호를 입력해주세요.");
    }

    // Cognito InitiateAuthCommand 실행
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.COGNITO_CLIENT_ID, // Cognito App Client ID
      AuthParameters: {
        USERNAME: email, // 이메일을 USERNAME으로 사용
        PASSWORD: password,
      },
    });

    const response = await client.send(command);

    // Cognito에서 발급된 토큰 추출
    const { AccessToken, IdToken, RefreshToken } =
      response.AuthenticationResult;

    return createCredentialResponse(200, {
      message: "Login successful",
      accessToken: AccessToken,
      idToken: IdToken,
      refreshToken: RefreshToken,
    });
  } catch (error) {
    console.error("Signin error:", error);

    // 오류 처리
    if (error.name === "UserNotConfirmedException") {
      return createCredentialResponse(400, {
        error: "사용자가 확인되지 않았습니다. 먼저 이메일을 확인해주세요.",
      });
    } else if (error.name === "NotAuthorizedException") {
      return createCredentialResponse(400, {
        error: "이메일 또는 비밀번호가 잘못되었습니다. 다시 시도해주세요.",
      });
    } else if (error.name === "UserNotEnabledException") {
      // 비활성화된 계정 처리
      return createCredentialResponse(403, {
        error: "계정이 비활성화되었습니다. 지원팀에 문의해주세요.",
      });
    } else if (error.name === "InvalidParameterException") {
      return createCredentialResponse(400, {
        error: "유효하지 않은 입력입니다. 입력 값을 확인해주세요.",
      });
    }

    // 일반적인 오류 처리
    return createCredentialResponse(500, {
      error: "An unexpected error occurred.",
    });
  }
};
