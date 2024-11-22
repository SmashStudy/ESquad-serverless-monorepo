import { putItem } from './putItem.mjs';
const meetingsTableName = process.env.MEETINGS_TABLE_NAME;
const oneDayFromNow = Math.floor(Date.now() / 1000) + 60 * 60 * 24;

/**
 * 회의 정보를 DynamoDB에 저장합니다.
 * @param {string} title - 회의 제목
 * @param {Object} meetingInfo - 저장할 회의 정보 객체
 * @returns {void}
 * @throws {Error} - DynamoDB 오류 발생 시
 */
export const putMeeting = async (title, meetingInfo) => {
  try {
    // 회의 정보 항목 구성
    const item = {
      Title: { S: title },
      Data: { S: JSON.stringify(meetingInfo) },
      TTL: { N: '' + oneDayFromNow },
    };

    // DynamoDB에 항목 저장
    await putItem(meetingsTableName, item);

    console.log(`Meeting "${title}" saved successfully`);
  } catch (error) {
    // 예외 처리
    console.error('Error saving meeting:', error);

    // DynamoDB 관련 오류 처리
    throw new Error(`Failed to save meeting: ${error.message}`);
  }
};
