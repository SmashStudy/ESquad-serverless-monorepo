import jwt from "jsonwebtoken";
import { createResponse } from "../util/responseHelper.mjs"; // createResponse 함수 가져오기

export const handler = async (event) => {
  try {
    const token = event.headers.Authorization?.split(" ")[1];
    if (!token) {
      return createResponse(401, {
        message: "Unauthorized: No token provided",
      });
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

    return createResponse(200, { role });
  } catch (error) {
    console.error("Error decoding token:", error);

    return createResponse(500, {
      message: "Internal server error",
      error: error.message,
    });
  }
};
