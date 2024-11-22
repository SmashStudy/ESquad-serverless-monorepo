import { getItem } from './getItem.mjs';
const meetingsTableName = process.env.MEETINGS_TABLE_NAME;

/**
 * 회의 정보를 DynamoDB에서 가져옵니다.
 * @param {string} meetingTitle - 회의 제목
 * @returns {Object|null} - 회의 정보 객체 또는 null (존재하지 않을 경우)
 * @throws {Error} - DynamoDB 오류 발생 시
 */
export const getMeeting = async (meetingTitle) => {
  try {
    // DynamoDB에서 회의 정보 조회
    const meeting = await getItem(meetingsTableName, { Title: { S: meetingTitle } });

    // 회의 정보가 존재하고, Data가 정상적으로 반환된 경우
    if (meeting && meeting.Data && meeting.Data.S) {
      return JSON.parse(meeting.Data.S);
    }

    // 회의 정보가 존재하지 않으면 null 반환
    return null;
  } catch (error) {
    // DynamoDB 오류 처리
    console.error('Error fetching meeting:', error);

    // DynamoDB에서 발생한 오류를 명확히 처리
    throw new Error(`Failed to retrieve meeting: ${error.message}`);
  }
};
