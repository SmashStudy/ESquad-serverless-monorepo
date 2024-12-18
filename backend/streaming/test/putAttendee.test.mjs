// 테스트 파일 상단에서 dynamoClient를 모킹
jest.mock('../src/dynamoClient.mjs', () => ({
  ddb: {
    send: jest.fn(), // send를 jest.fn()으로 모킹
  },
}));

import { ddb } from '../src/dynamoClient.mjs';
import { putAttendee } from '../src/putAttendee.mjs';
import { TransactWriteItemsCommand } from '@aws-sdk/client-dynamodb';

describe('putAttendee 함수 테스트', () => {
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeAll(() => {
    // 환경 변수 설정
    process.env.ATTENDEES_TABLE_NAME = 'TestAttendeesTable';
    process.env.PARTICIPANT_USAGE_TABLE_NAME = 'TestParticipantUsageTable';
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

  test('참가자 정보를 성공적으로 저장해야 합니다', async () => {
    const title = '테스트 회의';
    const attendeeId = 'attendee123';
    const attendeeName = '참석자1';
    const userEmail = 'test@example.com';
    const teamId = 'team123';

    // ddb.send 성공 모킹
    ddb.send.mockResolvedValue({});

    await putAttendee(title, attendeeId, attendeeName, userEmail, teamId);

    expect(ddb.send).toHaveBeenCalledTimes(1);
    const callArgs = ddb.send.mock.calls[0][0];
    expect(callArgs).toBeInstanceOf(TransactWriteItemsCommand);

    const params = callArgs.input;
    expect(params.TransactItems).toHaveLength(2);

    const attendeeItem = params.TransactItems[0].Put.Item;
    expect(attendeeItem.attendeeId.S).toBe(`${title}/${attendeeId}`);
    expect(attendeeItem.name.S).toBe(attendeeName);
    expect(attendeeItem.ttl.N).toEqual(expect.any(String));

    const usageItem = params.TransactItems[1].Put.Item;
    expect(usageItem.userEmail.S).toBe(userEmail);
    expect(usageItem.name.S).toBe(attendeeName);
    expect(usageItem.title.S).toBe(title);
    expect(usageItem.teamId.S).toBe(teamId);
    expect(usageItem.start_At.S).toEqual(expect.any(String));

    expect(consoleLogSpy).toHaveBeenCalledWith(`참가자 "${attendeeName}"이(가) 회의 "${title}"에 성공적으로 추가되었으며, 사용 기록이 추적되었습니다.`);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('DynamoDB 오류가 발생하면 예외를 던져야 합니다', async () => {
    const title = '테스트 회의';
    const attendeeId = 'attendee123';
    const attendeeName = '참석자1';
    const userEmail = 'test@example.com';
    const teamId = 'team123';
    const error = new Error('DynamoDB 오류');

    ddb.send.mockRejectedValue(error);

    await expect(putAttendee(title, attendeeId, attendeeName, userEmail, teamId))
      .rejects.toThrow(`참가자 저장 및 사용 기록 추적에 실패했습니다: ${error.message}`);

    expect(ddb.send).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('참가자 저장 및 사용 기록 추적 중 오류 발생:', error);
  });

  test('TTL 값이 정상적으로 설정되어야 합니다', async () => {
    const title = '테스트 회의';
    const attendeeId = 'attendee123';
    const attendeeName = '참석자1';
    const userEmail = 'test@example.com';
    const teamId = 'team123';

    ddb.send.mockResolvedValue({});

    await putAttendee(title, attendeeId, attendeeName, userEmail, teamId);

    const callArgs = ddb.send.mock.calls[0][0];
    const attendeeItem = callArgs.input.TransactItems[0].Put.Item;
    const ttl = parseInt(attendeeItem.ttl.N, 10);
    const now = Math.floor(Date.now() / 1000);
    const threeHoursInSeconds = 3 * 60 * 60;

    expect(ttl).toBeGreaterThan(now);
    expect(ttl).toBeLessThanOrEqual(now + threeHoursInSeconds);
  });
});
