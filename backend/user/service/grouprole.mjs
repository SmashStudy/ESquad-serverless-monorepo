import jwt from "jsonwebtoken";

export const handler = async (event) => {
  try {
    const token = event.headers.Authorization?.split(" ")[1];
    if (!token) {
      return {
        statusCode: 401,
        headers: {
          "Access-Control-Allow-Origin": "*", // 모든 도메인 허용
          "Access-Control-Allow-Headers": "Authorization, Content-Type", // 필요한 헤더
        },
        body: JSON.stringify({ message: "Unauthorized: No token provided" }),
      };
    }

    // JWT 디코딩 (검증 생략 - 선택적으로 추가 가능)
    const decodedToken = jwt.decode(token);
    const groups = decodedToken["cognito:groups"] || [];

    // 사용자 역할 반환
    let role = "unknown";
    if (groups.includes("admin")) {
      role = "admin";
    } else if (groups.includes("user")) {
      role = "user";
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", // 모든 도메인 허용
        "Access-Control-Allow-Headers": "Authorization, Content-Type", // 필요한 헤더
      },
      body: JSON.stringify({ role }),
    };
  } catch (error) {
    console.error("Error decoding token:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*", // 모든 도메인 허용
        "Access-Control-Allow-Headers": "Authorization, Content-Type", // 필요한 헤더
      },
      body: JSON.stringify({ message: "Internal server error", error: error.message }),
    };
  }
};
