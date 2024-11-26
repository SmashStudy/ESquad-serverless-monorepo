import { putItem } from '../service/putItem.mjs';
import { ddb } from '../service/dynamoClient.mjs';

jest.mock('../service/dynamoClient.mjs', () => ({
  ddb: {
    putItem: jest.fn(),
  },
}));

describe('putItem 함수 테스트', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('DynamoDB에 항목을 성공적으로 저장해야 합니다', async () => {
    const tableName = 'TestTable';
    const item = { key: { S: 'test-key' }, value: { S: 'test-value' } };

    // `ddb.putItem` 모킹 설정
    ddb.putItem.mockResolvedValue();

    await putItem(tableName, item);

    // `ddb.putItem` 호출 검증
    expect(ddb.putItem).toHaveBeenCalledWith({
      TableName: tableName,
      Item: item,
    });

    // `console.error` 호출되지 않았는지 확인
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('DynamoDB 오류가 발생하면 예외를 던져야 합니다', async () => {
    const tableName = 'TestTable';
    const item = { key: { S: 'test-key' }, value: { S: 'test-value' } };
    const error = new Error('DynamoDB 오류');

    // `ddb.putItem` 모킹 설정 (오류 발생)
    ddb.putItem.mockRejectedValue(error);

    // 오류 발생 여부 검증
    await expect(putItem(tableName, item)).rejects.toThrow('Failed to store item in DynamoDB.');

    // `ddb.putItem` 호출 검증
    expect(ddb.putItem).toHaveBeenCalledWith({
      TableName: tableName,
      Item: item,
    });

    // `console.error` 호출 여부 및 메시지 검증
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `Error putting item into table "${tableName}":`,
      error
    );
  });
});
