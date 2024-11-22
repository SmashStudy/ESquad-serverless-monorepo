import { getMeeting } from './db.mjs';
import { chimeSDKMeetings } from './chime.mjs';
import { CORS_HEADERS, handleOptions } from './cors.js';

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

    const meetingInfo = await getMeeting(title);

    if (!meetingInfo) {
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: 'Meeting not found' })
      };
    }

    await chimeSDKMeetings.deleteMeeting({ MeetingId: meetingInfo.Meeting.MeetingId });

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({ message: 'Meeting deleted successfully' })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: error.message
      }),
    };
  }
};
