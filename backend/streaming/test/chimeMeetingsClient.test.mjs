import { jest } from '@jest/globals';

// AWS SDK 클라이언트 모킹
jest.mock('@aws-sdk/client-chime-sdk-meetings', () => {
  return {
    ChimeSDKMeetings: jest.fn(),
  };
});

describe('ChimeSDKMeetings 클라이언트 초기화', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  test('ChimeSDKMeetings 클라이언트가 정상적으로 초기화되어야 합니다', async () => {
    const { ChimeSDKMeetings } = await import('@aws-sdk/client-chime-sdk-meetings');
    const mockInstance = {};
    ChimeSDKMeetings.mockImplementation(() => mockInstance);

    const { chimeSDKMeetings } = await import('../service/chimeMeetingsClient.mjs');

    expect(ChimeSDKMeetings).toHaveBeenCalledWith({ region: 'us-east-1' });
    expect(chimeSDKMeetings).toBe(mockInstance);
  });

  test('ChimeSDKMeetings 클라이언트 초기화 중 오류가 발생하면 콘솔에 로그를 출력하고 에러를 던져야 합니다', async () => {
    const { ChimeSDKMeetings } = await import('@aws-sdk/client-chime-sdk-meetings');
    const mockError = new Error('초기화 실패');
    ChimeSDKMeetings.mockImplementation(() => {
      throw mockError;
    });

    // console.error 스파이 설정
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // 동적 임포트를 사용하여 오류를 잡습니다.
    await expect(import('../service/chimeMeetingsClient.mjs')).rejects.toThrow('ChimeSDKMeetings 클라이언트를 초기화할 수 없습니다.');

    // console.error 호출 확인
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'ChimeSDKMeetings 클라이언트 초기화 중 오류 발생:',
      mockError
    );

    // 스파이 정리
    consoleErrorSpy.mockRestore();
  });
});
