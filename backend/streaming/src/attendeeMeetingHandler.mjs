import { getAttendee } from './getAttendee.mjs';
import { CORS_HEADERS, handleOptions } from './corsConfig.mjs';

export const handler = async (event) => {
  // OPTIONS 요청에 대한 처리
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
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
      headers: CORS_HEADERS, // CORS 헤더 추가
      body: JSON.stringify(attendeeInfo, null, 2),
    };
  } catch (error) {
    console.error(error);

    // 에러 응답
    return {
      statusCode: 500,
      headers: CORS_HEADERS, // CORS 헤더 추가
      body: JSON.stringify({ error: error.message }),
    };
  }
};
