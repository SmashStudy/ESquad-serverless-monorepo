import {
    CognitoIdentityProviderClient,
    AdminAddUserToGroupCommand,
    AdminRemoveUserFromGroupCommand,
    ListUsersCommand,
  } from "@aws-sdk/client-cognito-identity-provider";
  import { createResponse } from "../util/responseHelper.mjs"; // 공통 응답 함수
  
  const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.REGION });
  const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
  const ADMIN_GROUP = "admin";
  
  export const handler = async (event) => {
    try {
      const { httpMethod, body } = event;
  
      // OPTIONS 요청 처리
      if (httpMethod === "OPTIONS") {
        return createResponse(200, { message: "CORS preflight check passed" });
      }
  
      if (!body) {
        return createResponse(400, { message: "Request body is required" });
      }
  
      const { email } = JSON.parse(body);
  
      if (!email) {
        return createResponse(400, { message: "Email is required" });
      }
  
      // 이메일로 사용자 검색
      const searchCommand = new ListUsersCommand({
        UserPoolId: USER_POOL_ID,
        Filter: `email = "${email}"`,
      });
  
      const searchResponse = await cognitoClient.send(searchCommand);
  
      if (searchResponse.Users.length === 0) {
        return createResponse(404, { message: `User with email ${email} not found` });
      }
  
      const username = searchResponse.Users[0].Username; // 검색된 사용자의 Username
  
      if (httpMethod === "POST" && event.path.endsWith("/add")) {
        // 그룹에 사용자 추가
        const command = new AdminAddUserToGroupCommand({
          UserPoolId: USER_POOL_ID,
          Username: username,
          GroupName: ADMIN_GROUP,
        });
  
        await cognitoClient.send(command);
  
        return createResponse(200, { message: `User ${email} added to admin group` });
      }
  
      if (httpMethod === "POST" && event.path.endsWith("/remove")) {
        // 그룹에서 사용자 제거
        const command = new AdminRemoveUserFromGroupCommand({
          UserPoolId: USER_POOL_ID,
          Username: username,
          GroupName: ADMIN_GROUP,
        });
  
        await cognitoClient.send(command);
  
        return createResponse(200, { message: `User ${email} removed from admin group` });
      }
  
      return createResponse(400, { message: "Invalid request path or method" });
    } catch (error) {
      console.error("Error managing user group:", error);
  
      return createResponse(500, { message: "Error managing user group", error: error.message });
    }
  };
