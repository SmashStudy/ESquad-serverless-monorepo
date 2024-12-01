import { CORS_HEADERS, handleOptions } from './corsConfig.mjs';
import { deleteMeeting } from './deleteMeeting.mjs';

export const handler = async (event) => {
  // 프리플라이트(OPTIONS) 요청 처리
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  try {
    const { title } = JSON.parse(event.body);

    if (!title) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: 'Title is required' })
      };
    }

    const response = await deleteMeeting(title);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(response)
    };
  } catch (error) {
    return {
      statusCode: error.message === 'Meeting not found' ? 404 : 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        message: error.message === 'Meeting not found' ? 'Meeting not found' : 'Internal Server Error',
        error: error.message
      }),
    };
  }
};
