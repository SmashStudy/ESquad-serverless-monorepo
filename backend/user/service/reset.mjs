import {
  CognitoIdentityProviderClient,
  ForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { createResponse } from "../util/responseHelper.mjs"; // createResponse 함수 가져오기

const client = new CognitoIdentityProviderClient({
  region: process.env.REGION,
});

export const handler = async (event) => {
  try {
    const { email } = JSON.parse(event.body);

    if (!email) {
      throw new Error("Email is required");
    }

    const params = {
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
    };

    const command = new ForgotPasswordCommand(params);
    await client.send(command);

    return createResponse(200, {
      message: "Password reset code sent to email",
    });
  } catch (error) {
    console.error("Password reset request error:", error);

    // 에러 응답
    return createResponse(400, {
      error: error.message,
    });
  }
};