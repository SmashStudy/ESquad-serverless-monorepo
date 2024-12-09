// 테스트 환경 변수 설정: 반드시 모듈 import 전에 설정
process.env.MEETING_ROOM_USAGE_TABLE_NAME = 'TestMeetingRoomUsageTable';

jest.mock('../src/dynamoClient.mjs', () => ({
  ddb: {
    send: jest.fn(),
  },
}));

import { QueryCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { ddb } from '../src/dynamoClient.mjs';
import { updateMeetingRoomUsage } from '../src/updateMeetingRoomUsage.mjs';

describe('updateMeetingRoomUsage', () => {
  let consoleLogSpy;
  let consoleWarnSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  test('회의실 사용 기록이 존재하고 업데이트에 성공하는 경우', async () => {
    const title = 'ExistingMeeting';

    // QueryCommand 응답: Items 존재
    ddb.send.mockResolvedValueOnce({
      Items: [
        {
          title: { S: title },
          start_At: { S: '2024-01-01T00:00:00.000Z' }
        }
      ]
    });

    // UpdateItemCommand 응답: 정상 업데이트
    ddb.send.mockResolvedValueOnce({});

    await updateMeetingRoomUsage(title);

    expect(ddb.send.mock.calls[0][0]).toBeInstanceOf(QueryCommand);
    expect(ddb.send.mock.calls[1][0]).toBeInstanceOf(UpdateItemCommand);
    expect(consoleLogSpy).toHaveBeenCalledWith(`회의실 사용 기록이 "${title}"에 대해 업데이트되었습니다.`);
    expect(consoleWarnSpy).not.toHaveBeenCalled();
  });

  test('회의실 사용 기록이 존재하지 않는 경우 경고 로그를 출력', async () => {
    const title = 'NonExistingMeeting';

    // QueryCommand 응답: Items 없음
    ddb.send.mockResolvedValueOnce({ Items: [] });

    await updateMeetingRoomUsage(title);

    expect(ddb.send.mock.calls[0][0]).toBeInstanceOf(QueryCommand);
    // 여기서 toHaveBeenCalledWith로 정확히 동일한 문자열을 확인
    expect(consoleWarnSpy).toHaveBeenCalledWith(`회의 "${title}"에 대한 사용 기록이 "TestMeetingRoomUsageTable" 테이블에 존재하지 않습니다.`);
    expect(consoleLogSpy).not.toHaveBeenCalled();
  });
});
