import { putItem } from './putItem.mjs';
const attendeesTableName = process.env.ATTENDEES_TABLE_NAME;
const threeHoursFromNow = Math.floor(Date.now() / 1000) + 60 * 60 * 3;

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
    // 저장할 항목 구성
    const item = {
      AttendeeId: { S: `${title}/${attendeeId}` },
      Name: { S: attendeeName },
      TTL: { N: '' + threeHoursFromNow },
    };

    // DynamoDB에 항목 저장
    await putItem(attendeesTableName, item);

    console.log(`Attendee ${attendeeName} added successfully to ${title}`);
  } catch (error) {
    // 예외 처리
    console.error('Error saving attendee:', error);

    // DynamoDB 관련 오류 처리
    throw new Error(`Failed to save attendee: ${error.message}`);
  }
};
