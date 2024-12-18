import { getItem } from './getItem.mjs';
const attendeesTableName = process.env.ATTENDEES_TABLE_NAME;

/**
 * 참가자 정보를 DynamoDB에서 가져옵니다.
 * @param {string} title - 회의 제목
 * @param {string} attendeeId - 참가자 ID
 * @returns {string} - 참가자 이름 또는 '알 수 없음' (존재하지 않을 경우)
 * @throws {Error} - DynamoDB 오류 발생 시
 */
export const getAttendee = async (title, attendeeId) => {
  try {
    // DynamoDB에서 참가자 정보 조회
    const attendee = await getItem(attendeesTableName, { attendeeId: { S: `${title}/${attendeeId}` } });

    // 참가자가 존재하고, Name 속성이 올바르게 반환되는 경우
    if (attendee && attendee.name && attendee.name.S) {
      return attendee.name.S;
    }

    // 참가자가 존재하지 않거나 이름 정보가 없을 경우 '알 수 없음' 반환
    return '알 수 없음';
  } catch (error) {
    // DynamoDB 오류 처리
    console.error('참가자 정보 조회 중 오류 발생:', error);

    // DynamoDB에서 발생한 오류를 명확히 처리
    throw new Error(`참가자 정보를 가져오는 데 실패했습니다: ${error.message}`);
  }
};
