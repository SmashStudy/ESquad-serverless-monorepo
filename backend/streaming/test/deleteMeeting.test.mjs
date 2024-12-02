import { deleteMeeting } from '../src/deleteMeeting.mjs';
import { chimeSDKMeetings } from '../src/chimeMeetingsClient.mjs';
import { getMeeting } from '../src/getMeeting.mjs';

// Jest를 사용하여 모듈 모킹
jest.mock('../src/chimeMeetingsClient.mjs', () => ({
  chimeSDKMeetings: {
    deleteMeeting: jest.fn(),
  },
}));

jest.mock('../src/getMeeting.mjs', () => ({
  getMeeting: jest.fn(),
}));

describe('deleteMeeting 함수 테스트', () => {
  let consoleErrorSpy;

  // 각 테스트 전에 모킹된 함수들을 초기화하고 console.error를 모킹
  beforeEach(() => {
    jest.clearAllMocks();
    // console.error를 모킹하여 테스트 중에 출력되지 않도록 함
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  // 각 테스트 후에 console.error 원래대로 복구
  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('성공적으로 회의를 삭제해야 합니다', async () => {
    const title = '테스트 회의';
    const fakeMeetingInfo = { Meeting: { MeetingId: 'meeting123' } };

    // 모킹된 함수들의 반환 값 설정
    getMeeting.mockResolvedValue(fakeMeetingInfo);
    chimeSDKMeetings.deleteMeeting.mockResolvedValue();

    // 함수 호출
    const result = await deleteMeeting(title);

    // 호출 여부 및 인자 검증
    expect(getMeeting).toHaveBeenCalledWith(title);
    expect(chimeSDKMeetings.deleteMeeting).toHaveBeenCalledWith({
      MeetingId: fakeMeetingInfo.Meeting.MeetingId,
    });
    expect(result).toEqual({ message: 'Meeting deleted successfully' });

    // console.error가 호출되지 않았는지 검증
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

    test('회의가 존재하지 않을 때 오류를 처리해야 합니다', async () => {
    const title = '존재하지 않는 회의';

    // 모킹된 함수들의 반환 값 설정
    getMeeting.mockResolvedValue(null);

    // 오류 발생 여부 및 메시지 검증
    await expect(deleteMeeting(title)).rejects.toThrow('Meeting not found');

    // 호출 여부 및 인자 검증
    expect(getMeeting).toHaveBeenCalledWith(title);
    expect(chimeSDKMeetings.deleteMeeting).not.toHaveBeenCalled();

    // console.error가 호출되었는지 검증
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting meeting:', new Error('Meeting not found'));
  });

  test('BadRequestException 오류를 처리해야 합니다', async () => {
    const title = '테스트 회의';
    const fakeMeetingInfo = { Meeting: { MeetingId: 'meeting123' } };
    const error = new Error('BadRequestException: Invalid request');

    // 모킹된 함수들의 반환 값 설정
    getMeeting.mockResolvedValue(fakeMeetingInfo);
    chimeSDKMeetings.deleteMeeting.mockRejectedValue(error);

    // 오류 발생 여부 및 메시지 검증
    await expect(deleteMeeting(title)).rejects.toThrow('Invalid request to delete meeting');

    // 호출 여부 및 인자 검증
    expect(getMeeting).toHaveBeenCalledWith(title);
    expect(chimeSDKMeetings.deleteMeeting).toHaveBeenCalledWith({
      MeetingId: fakeMeetingInfo.Meeting.MeetingId,
    });

    // console.error가 호출되었는지 검증
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting meeting:', error);
  });

  test('ServiceUnavailable 오류를 처리해야 합니다', async () => {
    const title = '테스트 회의';
    const fakeMeetingInfo = { Meeting: { MeetingId: 'meeting123' } };
    const error = new Error('ServiceUnavailable: Chime service is down');

    // 모킹된 함수들의 반환 값 설정
    getMeeting.mockResolvedValue(fakeMeetingInfo);
    chimeSDKMeetings.deleteMeeting.mockRejectedValue(error);

    // 오류 발생 여부 및 메시지 검증
    await expect(deleteMeeting(title)).rejects.toThrow('Chime service unavailable, try again later');

    // 호출 여부 및 인자 검증
    expect(getMeeting).toHaveBeenCalledWith(title);
    expect(chimeSDKMeetings.deleteMeeting).toHaveBeenCalledWith({
      MeetingId: fakeMeetingInfo.Meeting.MeetingId,
    });

    // console.error가 호출되었는지 검증
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting meeting:', error);
  });

  test('일반적인 오류를 처리해야 합니다', async () => {
    const title = '테스트 회의';
    const fakeMeetingInfo = { Meeting: { MeetingId: 'meeting123' } };
    const error = new Error('Some other error');

    // 모킹된 함수들의 반환 값 설정
    getMeeting.mockResolvedValue(fakeMeetingInfo);
    chimeSDKMeetings.deleteMeeting.mockRejectedValue(error);

    // 오류 발생 여부 및 메시지 검증
    await expect(deleteMeeting(title)).rejects.toThrow('Failed to delete meeting: Some other error');

    // 호출 여부 및 인자 검증
    expect(getMeeting).toHaveBeenCalledWith(title);
    expect(chimeSDKMeetings.deleteMeeting).toHaveBeenCalledWith({
      MeetingId: fakeMeetingInfo.Meeting.MeetingId,
    });

    // console.error가 호출되었는지 검증
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error deleting meeting:', error);
  });
});
