import {
    CognitoIdentityProviderClient,
    ConfirmForgotPasswordCommand,
  } from "@aws-sdk/client-cognito-identity-provider";
  
  const client = new CognitoIdentityProviderClient({
    region: process.env.REGION,
  });
  
  export const handler = async (event) => {
    try {
      const { email, confirmationCode, newPassword } = JSON.parse(event.body);
  
      const params = {
        ClientId: process.env.COGNITO_CLIENT_ID,
        Username: email,
        ConfirmationCode: confirmationCode,
        Password: newPassword,
      };
  
      const command = new ConfirmForgotPasswordCommand(params);
      await client.send(command);
  
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          message: "Password has been reset successfully",
        }),
      };
    } catch (error) {
      console.error("Confirm password reset error:", error);
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          error: error.message,
        }),
      };
    }
  };
  