import { DynamoDB } from '@aws-sdk/client-dynamodb';

// DynamoDB 클라이언트 초기화
const ddb = new DynamoDB();
const meetingsTableName = process.env.MEETINGS_TABLE_NAME;
const attendeesTableName = process.env.ATTENDEES_TABLE_NAME;
const oneDayFromNow = Math.floor(Date.now() / 1000) + 60 * 60 * 24;

/**
 * 회의 정보를 DynamoDB에서 가져옵니다.
 * @param {string} meetingTitle - 회의 제목
 * @returns {Object|null} - 회의 정보 객체 또는 null (존재하지 않을 경우)
 * @throws {Error} - DynamoDB 오류 발생 시
 */
export const getMeeting = async (meetingTitle) => {
  try {
    const result = await ddb.getItem({
      TableName: meetingsTableName,
      Key: { Title: { S: meetingTitle } },
    });

    if (result.Item && result.Item.Data && result.Item.Data.S) {
      return JSON.parse(result.Item.Data.S);
    }

    return null;
  } catch (error) {
    console.error(`Error fetching meeting "${meetingTitle}":`, error);
    throw new Error('Failed to fetch meeting information.');
  }
};

/**
 * 회의 정보를 DynamoDB에 저장합니다.
 * @param {string} title - 회의 제목
 * @param {Object} meetingInfo - 저장할 회의 정보 객체
 * @returns {void}
 * @throws {Error} - DynamoDB 오류 발생 시
 */
export const putMeeting = async (title, meetingInfo) => {
  try {
    await ddb.putItem({
      TableName: meetingsTableName,
      Item: {
        Title: { S: title },
        Data: { S: JSON.stringify(meetingInfo) },
        TTL: { N: '' + oneDayFromNow },
      },
    });
  } catch (error) {
    console.error(`Error putting meeting "${title}":`, error);
    throw new Error('Failed to store meeting information.');
  }
};

/**
 * 참가자 정보를 DynamoDB에서 가져옵니다.
 * @param {string} title - 회의 제목
 * @param {string} attendeeId - 참가자 ID
 * @returns {string} - 참가자 이름 또는 'Unknown' (존재하지 않을 경우)
 * @throws {Error} - DynamoDB 오류 발생 시
 */
export const getAttendee = async (title, attendeeId) => {
  try {
    const result = await ddb.getItem({
      TableName: attendeesTableName,
      Key: { AttendeeId: { S: `${title}/${attendeeId}` } },
    });

    if (result.Item && result.Item.Name && result.Item.Name.S) {
      return result.Item.Name.S;
    }

    return 'Unknown';
  } catch (error) {
    console.error(`Error fetching attendee "${attendeeId}" for meeting "${title}":`, error);
    throw new Error('Failed to fetch attendee information.');
  }
};

/**
 * 참가자 정보를 DynamoDB에 저장합니다.
 * @param {string} title - 회의 제목
 * @param {string} attendeeId - 참가자 ID
 * @param {string} attendeeName - 참가자 이름
 * @returns {void}
 * @throws {Error} - DynamoDB 오류 발생 시
 */
export const putAttendee = async (title, attendeeId, attendeeName) => {
  try {
    await ddb.putItem({
      TableName: attendeesTableName,
      Item: {
        AttendeeId: { S: `${title}/${attendeeId}` },
        Name: { S: attendeeName },
        TTL: { N: '' + oneDayFromNow },
      },
    });
  } catch (error) {
    console.error(`Error putting attendee "${attendeeId}" for meeting "${title}":`, error);
    throw new Error('Failed to store attendee information.');
  }
};
