import { jest } from '@jest/globals';

// 모듈을 Mock 처리
jest.mock('../src/getItem.mjs', () => ({
  getItem: jest.fn(),
}));

// Mock 함수 가져오기
import { getItem } from '../src/getItem.mjs';

describe('getMeeting 함수 테스트', () => {
  let getMeeting; // 동적으로 모듈 임포트
  let consoleErrorSpy;

  beforeEach(async () => {
    jest.clearAllMocks(); // 모든 Mock 초기화

    // 환경 변수 설정
    process.env.MEETINGS_TABLE_NAME = 'MeetingsTable';

    // console.error를 Mock 처리
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // getMeeting 모듈 동적 임포트 (환경 변수 설정 후)
    const module = await import('../src/getMeeting.mjs');
    getMeeting = module.getMeeting;
  });

  afterEach(() => {
    // console.error 원래 상태로 복구
    consoleErrorSpy.mockRestore();
  });

  test('DynamoDB에서 회의 정보가 존재하는 경우', async () => {
    const meetingTitle = 'Team Sync';
    const mockData = { title: 'Team Sync', Date: '2024-01-01', Participants: ['Alice', 'Bob'] };
    const mockDynamoDBResponse = {
      data: { S: JSON.stringify(mockData) },
    };

    // getItem Mock 설정
    getItem.mockResolvedValue(mockDynamoDBResponse);

    const result = await getMeeting(meetingTitle);

    expect(getItem).toHaveBeenCalledWith('MeetingsTable', { title: { S: meetingTitle } });
    expect(result).toEqual(mockData);
  });

  test('DynamoDB에서 회의 정보가 존재하지 않는 경우', async () => {
    const meetingTitle = 'Nonexistent Meeting';

    // getItem Mock 설정
    getItem.mockResolvedValue(null);

    const result = await getMeeting(meetingTitle);

    expect(getItem).toHaveBeenCalledWith('MeetingsTable', { title: { S: meetingTitle } });
    expect(result).toBeNull();
  });

  test('DynamoDB 호출 중 오류가 발생하는 경우', async () => {
    const meetingTitle = 'Error Meeting';
    const mockError = new Error('DynamoDB error');

    // getItem Mock 설정
    getItem.mockRejectedValue(mockError);

    // 코드에서 던지는 에러 메시지에 맞게 수정
    await expect(getMeeting(meetingTitle)).rejects.toThrow(`회의 정보를 가져오는 데 실패했습니다: ${mockError.message}`);

    expect(getItem).toHaveBeenCalledWith('MeetingsTable', { title: { S: meetingTitle } });
    expect(consoleErrorSpy).toHaveBeenCalledWith('회의 정보를 조회하는 중 오류 발생:', mockError);
  });

  test('회의 정보에 Data가 없으면 null을 반환', async () => {
    const meetingTitle = 'No Data Meeting';
    const mockDynamoDBResponse = {
      // Data 필드 없음
    };

    // getItem Mock 설정
    getItem.mockResolvedValue(mockDynamoDBResponse);

    const result = await getMeeting(meetingTitle);

    expect(getItem).toHaveBeenCalledWith('MeetingsTable', { title: { S: meetingTitle } });
    expect(result).toBeNull();
  });

  test('회의 정보의 Data.S가 없는 경우 null을 반환', async () => {
    const meetingTitle = 'Invalid Data Meeting';
    const mockDynamoDBResponse = {
      data: {}, // S 필드 없음
    };

    // getItem Mock 설정
    getItem.mockResolvedValue(mockDynamoDBResponse);

    const result = await getMeeting(meetingTitle);

    expect(getItem).toHaveBeenCalledWith('MeetingsTable', { title: { S: meetingTitle } });
    expect(result).toBeNull();
  });
});
