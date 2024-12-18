const allowedOrigins = [
  "https://www.live.esquad.click",
  "https://live.dev.esquad.click",
];

export const handleOptions = (origin) => {
  const isAllowedOrigin = allowedOrigins.includes(origin);

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "null", // 허용된 Origin만 설정
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    },
    body: "",
  };
};

export const CORS_HEADERS = (origin) => {
  const isAllowedOrigin = allowedOrigins.includes(origin);

  return {
    "Access-Control-Allow-Origin": isAllowedOrigin ? origin : "null", // 허용된 Origin만 설정
    "Access-Control-Allow-Credentials": true,
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
  };
};
