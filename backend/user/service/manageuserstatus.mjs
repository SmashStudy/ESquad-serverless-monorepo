import {
    CognitoIdentityProviderClient,
    ListUsersCommand,
    AdminEnableUserCommand,
    AdminDisableUserCommand,
  } from "@aws-sdk/client-cognito-identity-provider";
  
  const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.REGION });
  
  export const handler = async (event) => {
    try {
      // OPTIONS 요청 처리 (CORS Preflight)
      if (event.httpMethod === "OPTIONS") {
        return {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": "*", // 필요한 경우 특정 도메인으로 제한
            "Access-Control-Allow-Methods": "POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
          body: JSON.stringify({ message: "CORS preflight check passed" }),
        };
      }
  
      const { email, action } = JSON.parse(event.body);
  
      if (!email || !["enable", "disable"].includes(action)) {
        return {
          statusCode: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Authorization, Content-Type",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
          },
          body: JSON.stringify({ message: "Invalid input. Email and valid action (enable/disable) are required." }),
        };
      }
  
      // 이메일로 사용자 검색
      const listUsersCommand = new ListUsersCommand({
        UserPoolId: process.env.COGNITO_USER_POOL_ID,
        Filter: `email = "${email}"`,
      });
  
      const listResponse = await cognitoClient.send(listUsersCommand);
  
      if (!listResponse.Users || listResponse.Users.length === 0) {
        return {
          statusCode: 404,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Authorization, Content-Type",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
          },
          body: JSON.stringify({ message: "User not found." }),
        };
      }
  
      const userName = listResponse.Users[0].Username;
  
      // 활성화/비활성화 처리
      const adminCommand =
        action === "enable"
          ? new AdminEnableUserCommand({ UserPoolId: process.env.COGNITO_USER_POOL_ID, Username: userName })
          : new AdminDisableUserCommand({ UserPoolId: process.env.COGNITO_USER_POOL_ID, Username: userName });
  
      await cognitoClient.send(adminCommand);
  
      return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Authorization, Content-Type",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
          },
        body: JSON.stringify({ message: `User ${action}d successfully.` }),
      };
    } catch (error) {
      console.error("Error managing user status:", error);
      return {
        statusCode: 500,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Authorization, Content-Type",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
          },
        body: JSON.stringify({ message: "Error managing user status.", error: error.message }),
      };
    }
  };
  