import { getAttendee } from "./getAttendee.mjs";
import { CORS_HEADERS, handleOptions } from "./corsConfig.mjs";

export const handler = async (event) => {
  const origin = event.headers?.origin || ""; // 요청 Origin 추출

  // OPTIONS 요청에 대한 처리
  if (event.httpMethod === "OPTIONS") {
    return handleOptions(origin); // Origin 전달
  }

  try {
    const { title, attendeeId } = event.queryStringParameters;

    // getAttendee 함수 호출
    const attendeeInfo = {
      AttendeeId: attendeeId,
      Name: await getAttendee(title, attendeeId),
    };

    // 성공 응답
    return {
      statusCode: 200,
      headers: CORS_HEADERS(origin), // Origin 기반으로 동적 CORS 헤더 설정
      body: JSON.stringify(attendeeInfo, null, 2),
    };
  } catch (error) {
    console.error(error);

    // 에러 응답
    return {
      statusCode: 500,
      headers: CORS_HEADERS(origin), // Origin 기반으로 동적 CORS 헤더 설정
      body: JSON.stringify({ error: error.message }),
    };
  }
};
