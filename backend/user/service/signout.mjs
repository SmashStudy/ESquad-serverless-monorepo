import {
  CognitoIdentityProviderClient,
  GlobalSignOutCommand,
} from "@aws-sdk/client-cognito-identity-provider";

import { createResponse } from "../util/responseHelper.mjs";

// Cognito 클라이언트 생성
const client = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION, // AWS 리전 설정
});

export const handler = async (event) => {
  try {
    // 요청 헤더에서 Authorization 추출
    const authHeader =
      event.headers?.Authorization || event.headers?.authorization;
    if (!authHeader) {
      return createResponse(401, { error: "Authorization header is missing" });
    }

    // Bearer 토큰 형식에서 JWT 토큰 추출
    const accessToken = authHeader.split(" ")[1];
    if (!accessToken) {
      return createResponse(401, { error: "Access token is missing" });
    }

    // Cognito의 GlobalSignOutCommand 호출
    const command = new GlobalSignOutCommand({ AccessToken: accessToken });
    await client.send(command);

    return createResponse(200, { message: "Logout successful" });
  } catch (error) {
    console.error("Signout error:", error);

    // 에러 응답 반환
    if (error.name === "NotAuthorizedException") {
      return createResponse(401, { error: "The provided token is invalid or expired." });
    }

    return createResponse(500, { error: "An unexpected error occurred." });
  }
};
