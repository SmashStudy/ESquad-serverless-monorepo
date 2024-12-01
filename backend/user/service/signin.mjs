import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import {createResponse} from '../util/responseHelper.mjs'

const client = new CognitoIdentityProviderClient({
  region: process.env.REGION,
});

// CORS 설정
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // 필요한 경우 특정 Origin을 설정
  "Access-Control-Allow-Credentials": true,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
};

export const handler = async (event) => {
  // OPTIONS 요청 처리 (CORS preflight)
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: "",
    };
  }

  try {
    if (!event.body) {
      throw new Error("Request body is missing.");
    }

    // 요청 본문 파싱
    const { email, password } = JSON.parse(event.body);

    if (!email || !password) {
      throw new Error("Missing required fields: email and password.");
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

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
      },
      body: JSON.stringify({
        message: "Login successful",
        accessToken: AccessToken,
        idToken: IdToken,
        refreshToken: RefreshToken,
      }),
    };
  } catch (error) {
    console.error("Signin error:", error);

    // 오류 처리
    if (error.name === "UserNotConfirmedException") {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "User is not confirmed. Please confirm your email first.",
        }),
      };
    } else if (error.name === "NotAuthorizedException") {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Invalid email or password. Please try again.",
        }),
      };
    } else if (error.name === "InvalidParameterException") {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          error: "Invalid parameters. Please check your input.",
        }),
      };
    }

    // 일반적인 오류 처리
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({
        error: "An unexpected error occurred.",
      }),
    };
  }
};
