// 테스트 시작 전 환경 변수 설정
process.env.MEETINGS_TABLE_NAME = 'TestMeetingsTable';
process.env.MEETING_ROOM_USAGE_TABLE_NAME = 'TestMeetingRoomUsageTable';

// 모듈 및 종속성 import
import { deleteMeeting } from '../src/deleteMeeting.mjs';
import { chimeSDKMeetings } from '../src/chimeMeetingsClient.mjs';
import { getMeeting } from '../src/getMeeting.mjs';
import { ddb } from '../src/dynamoClient.mjs';
import { DeleteItemCommand, QueryCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

// 모듈 모킹
jest.mock('../src/chimeMeetingsClient.mjs', () => ({
  chimeSDKMeetings: {
    deleteMeeting: jest.fn(),
  },
}));

jest.mock('../src/getMeeting.mjs', () => ({
  getMeeting: jest.fn(),
}));

jest.mock('../src/dynamoClient.mjs', () => ({
  ddb: {
    send: jest.fn(),
  },
}));

describe('deleteMeeting 함수 테스트', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('성공적으로 회의를 삭제해야 합니다', async () => {
    const title = '테스트 회의';
    const participant = '1'; // participant를 "1"로 설정
    const fakeMeetingInfo = { Meeting: { MeetingId: 'meeting123' } };

    getMeeting.mockResolvedValue(fakeMeetingInfo);
    chimeSDKMeetings.deleteMeeting.mockResolvedValue();

    // ddb.send에 대한 mock 처리
    ddb.send.mockImplementation((command) => {
      if (command instanceof DeleteItemCommand) {
        // 회의 테이블에서 삭제 성공
        return Promise.resolve({});
      } else if (command instanceof QueryCommand) {
        // 사용기록 조회 시 최근 항목 하나 반환
        return Promise.resolve({
          Items: [
            {
              title: { S: title },
              start_At: { S: new Date().toISOString() },
            },
          ],
        });
      } else if (command instanceof UpdateItemCommand) {
        // 사용기록 업데이트 성공
        return Promise.resolve({});
      }
      return Promise.resolve({});
    });

    const result = await deleteMeeting(title, participant);

    expect(getMeeting).toHaveBeenCalledWith(title);
    expect(chimeSDKMeetings.deleteMeeting).toHaveBeenCalledWith({
      MeetingId: fakeMeetingInfo.Meeting.MeetingId,
    });
    // DynamoDB 관련 명령이 총 3번 호출(삭제 1회, 조회 1회, 업데이트 1회)되는지 확인 가능
    expect(ddb.send).toHaveBeenCalledTimes(3);
    expect(result).toEqual({ message: '회의가 성공적으로 삭제되고 회의실 사용이 업데이트되었습니다.' });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('회의가 존재하지 않을 때 오류를 처리해야 합니다', async () => {
    const title = '존재하지 않는 회의';
    const participant = '1';
    getMeeting.mockResolvedValue(null);

    await expect(deleteMeeting(title, participant)).rejects.toThrow('회의를 찾을 수 없습니다.');

    expect(getMeeting).toHaveBeenCalledWith(title);
    expect(chimeSDKMeetings.deleteMeeting).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  test('BadRequestException 오류를 처리해야 합니다', async () => {
    const title = '테스트 회의';
    const participant = '1';
    const fakeMeetingInfo = { Meeting: { MeetingId: 'meeting123' } };
    const error = new Error('BadRequestException: Invalid request');

    getMeeting.mockResolvedValue(fakeMeetingInfo);
    chimeSDKMeetings.deleteMeeting.mockRejectedValue(error);

    await expect(deleteMeeting(title, participant)).rejects.toThrow('회의 삭제 요청이 잘못되었습니다.');
    expect(getMeeting).toHaveBeenCalledWith(title);
    expect(chimeSDKMeetings.deleteMeeting).toHaveBeenCalledWith({
      MeetingId: fakeMeetingInfo.Meeting.MeetingId,
    });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  test('ServiceUnavailable 오류를 처리해야 합니다', async () => {
    const title = '테스트 회의';
    const participant = '1';
    const fakeMeetingInfo = { Meeting: { MeetingId: 'meeting123' } };
    const error = new Error('ServiceUnavailable: Chime service is down');

    getMeeting.mockResolvedValue(fakeMeetingInfo);
    chimeSDKMeetings.deleteMeeting.mockRejectedValue(error);

    await expect(deleteMeeting(title, participant)).rejects.toThrow('Chime 서비스가 현재 사용 불가합니다. 나중에 다시 시도해주세요.');
    expect(getMeeting).toHaveBeenCalledWith(title);
    expect(chimeSDKMeetings.deleteMeeting).toHaveBeenCalledWith({
      MeetingId: fakeMeetingInfo.Meeting.MeetingId,
    });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  test('일반적인 오류를 처리해야 합니다', async () => {
    const title = '테스트 회의';
    const participant = '1';
    const fakeMeetingInfo = { Meeting: { MeetingId: 'meeting123' } };
    const error = new Error('Some other error');

    getMeeting.mockResolvedValue(fakeMeetingInfo);
    chimeSDKMeetings.deleteMeeting.mockRejectedValue(error);

    await expect(deleteMeeting(title, participant)).rejects.toThrow('회의 삭제 및 회의실 사용 업데이트에 실패했습니다: Some other error');
    expect(getMeeting).toHaveBeenCalledWith(title);
    expect(chimeSDKMeetings.deleteMeeting).toHaveBeenCalledWith({
      MeetingId: fakeMeetingInfo.Meeting.MeetingId,
    });
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
