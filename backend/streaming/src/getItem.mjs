import { ddb } from './dynamoClient.mjs';

/**
 * DynamoDB에서 항목을 가져옵니다.
 * @param {string} tableName - 테이블 이름
 * @param {Object} key - 항목의 키
 * @returns {Object|null} - 항목 객체 또는 null (존재하지 않을 경우)
 * @throws {Error} - DynamoDB 오류 발생 시
 */
export const getItem = async (tableName, key) => {
  try {
    const result = await ddb.getItem({
      TableName: tableName,
      Key: key,
    });

    if (result.Item) {
      return result.Item;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching item from table "${tableName}":`, error);
    throw new Error('Failed to fetch item from DynamoDB.');
  }
};
