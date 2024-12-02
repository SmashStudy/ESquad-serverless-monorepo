import {
    CognitoIdentityProviderClient,
    ForgotPasswordCommand,
  } from "@aws-sdk/client-cognito-identity-provider";
  
  const client = new CognitoIdentityProviderClient({
    region: process.env.REGION,
  });
  
  export const handler = async (event) => {
    try {
      const { email } = JSON.parse(event.body);
  
      const params = {
        ClientId: process.env.COGNITO_CLIENT_ID,
        Username: email,
      };
  
      const command = new ForgotPasswordCommand(params);
      await client.send(command);
  
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          message: "Password reset code sent to email",
        }),
      };
    } catch (error) {
      console.error("Password reset request error:", error);
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
  