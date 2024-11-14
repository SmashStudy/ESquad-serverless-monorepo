import { getAttendee } from './db.mjs';

export const handler = async (event) => {
  const { title, attendeeId } = event.queryStringParameters;
  const attendeeInfo = {
    AttendeeId: attendeeId,
    Name: await getAttendee(title, attendeeId),
  };
  return { statusCode: 200, body: JSON.stringify(attendeeInfo, null, 2) };
};
