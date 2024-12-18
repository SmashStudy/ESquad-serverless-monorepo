import { jest } from '@jest/globals';
import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';

// dynamoClient를 먼저 모킹합니다.
jest.mock('../src/dynamoClient.mjs', () => ({
  ddb: {
    send: jest.fn(),
  },
}));

import { ddb } from '../src/dynamoClient.mjs';
import { putMeeting } from '../src/putMeeting.mjs';

describe('putMeeting 함수 테스트', () => {
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeAll(() => {
    // 환경 변수 설정
    process.env.MEETINGS_TABLE_NAME = 'testMeetingsTable';
    process.env.MEETING_ROOM_USAGE_TABLE_NAME = 'testMeetingRoomUsageTable';
  });

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test('회의 정보를 성공적으로 저장해야 합니다', async () => {
    const title = 'Test Meeting';
    const attendeeName = 'John Doe';
    const meetingInfo = { host: 'John Doe', participants: ['Alice', 'Bob'] };
    const userEmail = 'john@example.com';
    const teamId = 'team123';
    const status = 'true';

    ddb.send.mockResolvedValue({});

    await putMeeting(title, attendeeName, meetingInfo, userEmail, teamId, status);

    expect(ddb.send).toHaveBeenCalledTimes(1);
    const callArg = ddb.send.mock.calls[0][0];
    expect(callArg).toBeInstanceOf(TransactWriteItemsCommand);

    const params = callArg.input;
    expect(params.TransactItems).toHaveLength(2);

    const meetingItem = params.TransactItems[0].Put.Item;
    expect(meetingItem.title.S).toBe(title);
    expect(meetingItem.data.S).toBe(JSON.stringify(meetingInfo));
    expect(meetingItem.ttl.N).toEqual(expect.any(String));

    const usageItem = params.TransactItems[1].Put.Item;
    expect(usageItem.teamId.S).toBe(teamId);
    expect(usageItem.title.S).toBe(title);
    expect(usageItem.name.S).toBe(attendeeName);
    expect(usageItem.userEmail.S).toBe(userEmail);
    expect(usageItem.status.S).toBe(status);
    expect(usageItem.start_At.S).toEqual(expect.any(String));

    expect(consoleLogSpy).toHaveBeenCalledWith(`회의 "${title}"과(와) 사용 기록이 성공적으로 저장되었습니다.`);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('DynamoDB 오류가 발생하면 예외를 던져야 합니다', async () => {
    const title = 'Test Meeting';
    const attendeeName = 'John Doe';
    const meetingInfo = { host: 'John Doe', participants: ['Alice', 'Bob'] };
    const userEmail = 'john@example.com';
    const teamId = 'team123';
    const status = 'true';
    const error = new Error('DynamoDB Error');

    ddb.send.mockRejectedValue(error);

    await expect(putMeeting(title, attendeeName, meetingInfo, userEmail, teamId, status))
      .rejects.toThrow(`회의 정보 저장 및 사용 기록 추적에 실패했습니다: ${error.message}`);

    expect(consoleErrorSpy).toHaveBeenCalledWith("회의 정보 저장 및 사용 기록 추적 중 오류 발생:", error);
  });

  test('TTL 값이 정상적으로 설정되어야 합니다', async () => {
    const title = 'Test Meeting';
    const attendeeName = 'John Doe';
    const meetingInfo = { host: 'John Doe', participants: ['Alice', 'Bob'] };
    const userEmail = 'john@example.com';
    const teamId = 'team123';
    const status = 'true';

    ddb.send.mockResolvedValue({});

    await putMeeting(title, attendeeName, meetingInfo, userEmail, teamId, status);

    const callArg = ddb.send.mock.calls[0][0];
    const meetingItem = callArg.input.TransactItems[0].Put.Item;
    const ttl = parseInt(meetingItem.ttl.N, 10);
    const now = Math.floor(Date.now() / 1000);
    const threeHours = 3 * 60 * 60;

    expect(ttl).toBeGreaterThan(now);
    expect(ttl).toBeLessThanOrEqual(now + threeHours);
  });
});
