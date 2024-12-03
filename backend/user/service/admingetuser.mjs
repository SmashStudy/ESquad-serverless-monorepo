import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { createResponse } from "../util/responseHelper.mjs"; // createResponse 함수 가져오기

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.REGION,
});

export const handler = async (event) => {
  try {
    // OPTIONS 요청 처리 (CORS Preflight)
    if (event.httpMethod === "OPTIONS") {
      return createResponse(200, { message: "CORS preflight check passed" });
    }

    // 사용자 풀 ID 가져오기
    const userPoolId = process.env.COGNITO_USER_POOL_ID;

    // Cognito에서 사용자 목록 가져오기
    const command = new ListUsersCommand({
      UserPoolId: userPoolId,
    });

    const response = await cognitoClient.send(command);

    // 필요한 데이터 추출
    const users = response.Users.map((user) => {
      const email = user.Attributes.find((attr) => attr.Name === "email")?.Value || "N/A";
      const accountStatus = user.Enabled ? "활성화됨" : "비활성화됨"; // 계정 상태
      const lastLogin = user.UserLastModifiedDate || null; // 마지막 업데이트 시간
      const creationDate = user.UserCreateDate || null; // 생성일자

      return {
        email,
        accountStatus,
        lastLogin,
        creationDate, // 생성일자를 추가
      };
    });

    // 총 사용자 수
    const totalUsers = users.length;

    // 응답 데이터 반환
    return createResponse(200, { totalUsers, users });
  } catch (error) {
    console.error("Error fetching users:", error);

    // 에러 응답
    return createResponse(500, {
      message: "Error fetching user data",
      error: error.message,
    });
  }
};
