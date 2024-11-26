import { jest } from '@jest/globals';

describe('putMeeting 함수 테스트', () => {
  let putMeeting;
  let putItemMock;
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(async () => {
    // 모듈 캐시 초기화 및 모든 모킹 초기화
    jest.resetModules();
    jest.clearAllMocks();

    // 환경 변수 설정
    process.env.MEETINGS_TABLE_NAME = 'testMeetingsTable';

    // `putItem.mjs` 모듈을 모킹
    await jest.doMock('../service/putItem.mjs', () => ({
      putItem: jest.fn(),
    }));

    // 모킹된 `putItem` 가져오기
    const putItemModule = await import('../service/putItem.mjs');
    putItemMock = putItemModule.putItem;

    // 테스트 대상 함수 `putMeeting` 가져오기
    const putMeetingModule = await import('../service/putMeeting.mjs');
    putMeeting = putMeetingModule.putMeeting;

    // console.log와 console.error 모킹
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // 콘솔 스파이 복원
    if (consoleLogSpy) {
      consoleLogSpy.mockRestore();
    }
    if (consoleErrorSpy) {
      consoleErrorSpy.mockRestore();
    }
  });

  test('회의 정보를 성공적으로 저장해야 합니다', async () => {
    const title = 'Test Meeting';
    const meetingInfo = { host: 'John Doe', participants: ['Alice', 'Bob'] };

    const expectedItem = {
      Title: { S: title },
      Data: { S: JSON.stringify(meetingInfo) },
      TTL: { N: expect.any(String) },
    };

    // `putItem` 모킹 설정 (성공)
    putItemMock.mockResolvedValueOnce();

    await putMeeting(title, meetingInfo);

    // `putItem` 호출 검증
    expect(putItemMock).toHaveBeenCalledWith(process.env.MEETINGS_TABLE_NAME, expectedItem);

    // 로그 호출 검증
    expect(consoleLogSpy).toHaveBeenCalledWith(`Meeting "${title}" saved successfully`);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('DynamoDB 오류가 발생하면 예외를 던져야 합니다', async () => {
    const title = 'Test Meeting';
    const meetingInfo = { host: 'John Doe', participants: ['Alice', 'Bob'] };
    const error = new Error('DynamoDB error');

    // `putItem` 모킹 설정 (오류 발생)
    putItemMock.mockRejectedValueOnce(error);

    await expect(putMeeting(title, meetingInfo)).rejects.toThrow(
      'Failed to save meeting: DynamoDB error'
    );

    // `putItem` 호출 검증
    expect(putItemMock).toHaveBeenCalledWith(process.env.MEETINGS_TABLE_NAME, {
      Title: { S: title },
      Data: { S: JSON.stringify(meetingInfo) },
      TTL: { N: expect.any(String) },
    });

    // 오류 로그 호출 검증
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving meeting:', error);
  });

  test('TTL 값이 정상적으로 설정되어야 합니다', async () => {
    const title = 'Test Meeting';
    const meetingInfo = { host: 'John Doe', participants: ['Alice', 'Bob'] };

    putItemMock.mockResolvedValueOnce();

    await putMeeting(title, meetingInfo);

    // TTL 값 확인
    const [_, item] = putItemMock.mock.calls[0];
    const ttl = parseInt(item.TTL.N, 10);
    const now = Math.floor(Date.now() / 1000);
    const threeHours = 60 * 60 * 3;

    expect(ttl).toBeGreaterThan(now);
    expect(ttl).toBeLessThan(now + threeHours + 10); // 약간의 허용 오차
  });
});

