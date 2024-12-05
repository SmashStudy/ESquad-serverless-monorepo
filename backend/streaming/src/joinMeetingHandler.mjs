import { getMeeting } from './getMeeting.mjs';
import { CORS_HEADERS, handleOptions } from './corsConfig.mjs';
import { createMeeting } from './createMeeting.mjs';
import { createAttendee } from './createAttendee.mjs';

export const handler = async (event) => {
  // 프리플라이트(OPTIONS) 요청 처리
  if (event.httpMethod === 'OPTIONS') {
    return handleOptions();
  }

  try {
    const { title, attendeeName, region = 'us-east-1', ns_es } = JSON.parse(event.body);
    
    if (!title || !attendeeName) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: 'Must provide title and name' })
      };
    }

    let meetingInfo = await getMeeting(title);
    if (!meetingInfo) {
      meetingInfo = await createMeeting(title, region, ns_es);
    }

    const attendeeInfo = await createAttendee(title, meetingInfo.Meeting.MeetingId, attendeeName);

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        JoinInfo: { Title: title, Meeting: meetingInfo.Meeting, Attendee: attendeeInfo.Attendee },
      }),
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
