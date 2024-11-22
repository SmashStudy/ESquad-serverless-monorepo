import { getMeeting, putMeeting, putAttendee } from './db.mjs';
import { chimeSDKMeetings, uuid, getNotificationsConfig } from './chime.mjs';
import { CORS_HEADERS, handleOptions } from './cors.mjs';

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
      const request = {
        ClientRequestToken: uuid(),
        MediaRegion: region,
        NotificationsConfiguration: getNotificationsConfig(),
        ExternalMeetingId: title.substring(0, 64),
        MeetingFeatures: ns_es === 'true' ? { Audio: { EchoReduction: 'AVAILABLE' } } : undefined,
      };
      meetingInfo = await chimeSDKMeetings.createMeeting(request);
      await putMeeting(title, meetingInfo);
    }

    const attendeeInfo = await chimeSDKMeetings.createAttendee({
      MeetingId: meetingInfo.Meeting.MeetingId,
      ExternalUserId: uuid(),
    });
    await putAttendee(title, attendeeInfo.Attendee.AttendeeId, attendeeName);

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
