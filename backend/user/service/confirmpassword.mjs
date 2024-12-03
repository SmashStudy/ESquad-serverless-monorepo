import {
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { createCredentialResponse } from "../util/responseHelper.mjs"; // createResponse 함수 가져오기

const client = new CognitoIdentityProviderClient({
  region: process.env.REGION,
});

export const handler = async (event) => {
  try {
    const { email, confirmationCode, newPassword } = JSON.parse(event.body);

    if (!email || !confirmationCode || !newPassword) {
      return createCredentialResponse(400, {
        message: "Missing required fields: email, confirmationCode, and newPassword are required.",
      });
    }

    const params = {
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: confirmationCode,
      Password: newPassword,
    };

    const command = new ConfirmForgotPasswordCommand(params);
    await client.send(command);

    return createCredentialResponse(200, {
      message: "Password has been reset successfully",
    });
  } catch (error) {
    console.error("Confirm password reset error:", error);

    return createCredentialResponse(400, {
      message: "Failed to reset password",
      error: error.message,
    });
  }
};
