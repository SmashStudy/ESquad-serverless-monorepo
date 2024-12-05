import {
    CognitoIdentityProviderClient,
    GlobalSignOutCommand,
  } from "@aws-sdk/client-cognito-identity-provider";
  
  // Cognito 클라이언트 생성
  const client = new CognitoIdentityProviderClient({
    region: process.env.REGION, // AWS 리전 설정
  });
  
  export const handler = async (event) => {
    try {
      // 요청 헤더에서 Authorization 추출
      const authHeader =
        event.headers?.Authorization || event.headers?.authorization;
      if (!authHeader) {
        return {
          statusCode: 401,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
          },
          body: JSON.stringify({ error: "Authorization header is missing" }),
        };
      }
  
      // Bearer 토큰 형식에서 JWT 토큰 추출
      const idToken = authHeader.split(" ")[1];
      if (!idToken) {
        return {
          statusCode: 401,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Credentials": true,
          },
          body: JSON.stringify({ error: "JWT token is missing" }),
        };
      }
  
      // Cognito의 GlobalSignOutCommand 호출 (idToken은 AccessToken이 아님)
      // Cognito 로그아웃은 AccessToken이 필요합니다. idToken을 AccessToken으로 교체해야 한다면, 프론트엔드에서 올바른 AccessToken을 전달받도록 수정해야 합니다.
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          error: "idToken is provided, but GlobalSignOut requires AccessToken.",
        }),
      };
    } catch (error) {
      console.error("Signout error:", error);
  
      // 에러 응답 반환
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({ error: error.message }),
      };
    }
  };
  