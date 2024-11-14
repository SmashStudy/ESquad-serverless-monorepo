import { DynamoDB } from '@aws-sdk/client-dynamodb';

const ddb = new DynamoDB();
const meetingsTableName = process.env.MEETINGS_TABLE_NAME;
const attendeesTableName = process.env.ATTENDEES_TABLE_NAME;
const oneDayFromNow = Math.floor(Date.now() / 1000) + 60 * 60 * 24;

export const getMeeting = async (meetingTitle) => {
  const result = await ddb.getItem({
    TableName: meetingsTableName,
    Key: { Title: { S: meetingTitle } },
  });
  return result.Item ? JSON.parse(result.Item.Data.S) : null;
};

export const putMeeting = async (title, meetingInfo) => {
  await ddb.putItem({
    TableName: meetingsTableName,
    Item: {
      Title: { S: title },
      Data: { S: JSON.stringify(meetingInfo) },
      TTL: { N: '' + oneDayFromNow },
    },
  });
};

export const getAttendee = async (title, attendeeId) => {
  const result = await ddb.getItem({
    TableName: attendeesTableName,
    Key: { AttendeeId: { S: `${title}/${attendeeId}` } },
  });
  return result.Item ? result.Item.Name.S : 'Unknown';
};

export const putAttendee = async (title, attendeeId, attendeeName) => {
  await ddb.putItem({
    TableName: attendeesTableName,
    Item: {
      AttendeeId: { S: `${title}/${attendeeId}` },
      Name: { S: attendeeName },
      TTL: { N: '' + oneDayFromNow },
    },
  });
};
