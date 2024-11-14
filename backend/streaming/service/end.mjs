import { getMeeting } from './db.mjs';
import { chimeSDKMeetings } from './chime.mjs';

export const handler = async (event) => {
  const { title } = JSON.parse(event.body);
  const meetingInfo = await getMeeting(title);
  await chimeSDKMeetings.deleteMeeting({ MeetingId: meetingInfo.Meeting.MeetingId });
  return { statusCode: 200 };
};
