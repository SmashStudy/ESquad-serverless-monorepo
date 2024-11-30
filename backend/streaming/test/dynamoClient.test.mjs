import { jest } from '@jest/globals';

// DynamoDB 클라이언트 모킹
jest.mock('@aws-sdk/client-dynamodb', () => {
  return {
    DynamoDB: jest.fn(),
  };
});

describe('DynamoDB 클라이언트 초기화', () => {
  beforeEach(() => {
    jest.resetModules(); // 모듈 캐시 초기화
    jest.clearAllMocks(); // 모든 모킹 초기화
  });

  test('DynamoDB 클라이언트가 정상적으로 초기화되어야 합니다', async () => {
    const { DynamoDB } = await import('@aws-sdk/client-dynamodb');
    const mockInstance = {};
    DynamoDB.mockImplementation(() => mockInstance);

    const { ddb } = await import('../src/dynamoClient.mjs');

    expect(DynamoDB).toHaveBeenCalledWith({
      region: 'us-east-1',
    });
    expect(ddb).toBe(mockInstance);
  });

  test('DynamoDB 클라이언트 초기화 중 오류가 발생하면 콘솔에 로그를 출력하고 에러를 던져야 합니다', async () => {
    const { DynamoDB } = await import('@aws-sdk/client-dynamodb');
    const mockError = new Error('초기화 실패');
    DynamoDB.mockImplementation(() => {
      throw mockError;
    });

    // console.error 스파이 설정
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // 동적 임포트를 사용하여 오류를 잡습니다.
    await expect(import('../src/dynamoClient.mjs')).rejects.toThrow('DynamoDB 클라이언트를 초기화할 수 없습니다.');

    // console.error 호출 확인
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'DynamoDB 클라이언트 초기화 중 오류 발생:',
      mockError
    );

    // 스파이 정리
    consoleErrorSpy.mockRestore();
  });
});
