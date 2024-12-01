import { ddb } from './dynamoClient.mjs';

/**
 * DynamoDB에 항목을 저장합니다.
 * @param {string} tableName - 테이블 이름
 * @param {Object} item - 저장할 항목 객체
 * @returns {void}
 * @throws {Error} - DynamoDB 오류 발생 시
 */
export const putItem = async (tableName, item) => {
  try {
    await ddb.putItem({
      TableName: tableName,
      Item: item,
    });
  } catch (error) {
    console.error(`Error putting item into table "${tableName}":`, error);
    throw new Error('Failed to store item in DynamoDB.');
  }
};
