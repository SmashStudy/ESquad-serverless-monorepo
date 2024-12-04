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
        message: "필수 필드가 누락되었습니다: 이메일, 인증 코드 및 새 비밀번호가 필요합니다.",
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
      message: "비밀번호가 성공적으로 재설정되었습니다",
    });
  } catch (error) {
    console.error("비밀번호 재설정 확인 중 오류:", error);

    return createCredentialResponse(400, {
      message: "비밀번호 재설정에 실패했습니다",
      error: error.message,
    });
  }
};
