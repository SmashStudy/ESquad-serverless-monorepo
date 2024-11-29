import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { createResponse } from "../util/responseHelper.mjs";

const client = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
});

export const handler = async (event) => {
  try {
    const { email, code } = JSON.parse(event.body);

    if (!email || !code) {
      return createResponse(400, { error: "이메일과 확인 코드는 필수입니다." });
    }

    const command = new ConfirmSignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
    });

    const response = await client.send(command);
    return createResponse(200, { message: "확인 코드가 성공적으로 확인되었습니다.", response });
  } catch (error) {
    console.error("Confirm signup error:", error);

    if (error.name === "CodeMismatchException") {
      return createResponse(400, { error: "잘못된 확인 코드입니다." });
    } else if (error.name === "ExpiredCodeException") {
      return createResponse(400, { error: "확인 코드가 만료되었습니다." });
    } else if (error.name === "UserNotFoundException") {
      return createResponse(404, { error: "사용자를 찾을 수 없습니다." });
    }

    return createResponse(500, { error: "확인 중 알 수 없는 오류가 발생했습니다.", message: error.message });
  }
};
