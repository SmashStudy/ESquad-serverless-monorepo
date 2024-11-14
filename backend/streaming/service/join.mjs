import { getMeeting, putMeeting, putAttendee } from './db.mjs';
import { chimeSDKMeetings, uuid, getNotificationsConfig } from './chime.mjs';

export const handler = async (event) => {
  const { title, attendeeName, region = 'us-east-1', ns_es } = JSON.parse(event.body);
  if (!title || !attendeeName) {
    return { statusCode: 400, body: 'Must provide title and name' };
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
    body: JSON.stringify({
      JoinInfo: { Title: title, Meeting: meetingInfo.Meeting, Attendee: attendeeInfo.Attendee },
    }),
  };
};
