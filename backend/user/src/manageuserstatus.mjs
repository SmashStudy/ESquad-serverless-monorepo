import {
  CognitoIdentityProviderClient,
  ListUsersCommand,
  AdminEnableUserCommand,
  AdminDisableUserCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { createResponse } from "../util/responseHelper.mjs"; // createResponse 함수 가져오기

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.REGION,
});

export const handler = async (event) => {
  // OPTIONS 요청 처리 (CORS Preflight)
  if (event.httpMethod === "OPTIONS") {
    return createResponse(200, { message: "CORS preflight check passed" });
  }

  try {
    const { email, action } = JSON.parse(event.body);

    if (!email || !["enable", "disable"].includes(action)) {
      return createResponse(400, {
        message: "Invalid input. Email and valid action (enable/disable) are required.",
      });
    }

    // 이메일로 사용자 검색
    const listUsersCommand = new ListUsersCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Filter: `email = "${email}"`,
    });

    const listResponse = await cognitoClient.send(listUsersCommand);

    if (!listResponse.Users || listResponse.Users.length === 0) {
      return createResponse(404, { message: "User not found." });
    }

    const userName = listResponse.Users[0].Username;

    // 활성화/비활성화 처리
    const adminCommand =
      action === "enable"
        ? new AdminEnableUserCommand({
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: userName,
          })
        : new AdminDisableUserCommand({
            UserPoolId: process.env.COGNITO_USER_POOL_ID,
            Username: userName,
          });

    await cognitoClient.send(adminCommand);

    return createResponse(200, { message: `User ${action}d successfully.` });
  } catch (error) {
    console.error("Error managing user status:", error);

    return createResponse(500, {
      message: "Error managing user status.",
      error: error.message,
    });
  }
};
