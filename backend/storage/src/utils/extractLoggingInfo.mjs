import jwt from "jsonwebtoken";

export const requestExtractor = (event) => {
  // IP Address 추출
  const ipAddress = event.headers["X-Forwarded-For"]
      ? event.headers["X-Forwarded-For"].split(",")[0].trim()
      : event.requestContext.identity.sourceIp || "unknown-ip";

  // User-Agent 추출
  const userAgent = event.headers["User-Agent"] || "unknown-user-agent";

  // JWT 토큰 디코딩
  let email = "unknown-email";
  let group = [];
  try {
    const token = event.headers.Authorization?.split(" ")[1];
    if (token) {
      const decoded = jwt.decode(token);
      email = decoded.email || "unknown-email";
      const groups = decoded["cognito:groups"] || [];

      group = groups.find(role => role === "admin" || role === "user") || "unknown-role";
    }

  } catch (error) {
    console.error("Error decoding JWT token:", error);
  }

  return {
    ipAddress,
    userAgent,
    email,
    group,
  };
};
