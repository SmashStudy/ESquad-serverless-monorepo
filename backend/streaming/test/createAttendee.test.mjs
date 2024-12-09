import { createAttendee } from '../src/createAttendee.mjs';
import { chimeSDKMeetings } from '../src/chimeMeetingsClient.mjs';
import { uuid } from '../src/uuidGenerator.mjs';
import { putAttendee } from '../src/putAttendee.mjs';

// Jest를 사용하여 모듈 모킹
jest.mock('../src/chimeMeetingsClient.mjs', () => ({
  chimeSDKMeetings: {
    createAttendee: jest.fn(),
  },
}));

jest.mock('../src/uuidGenerator.mjs', () => ({
  uuid: jest.fn(),
}));

jest.mock('../src/putAttendee.mjs', () => ({
  putAttendee: jest.fn(),
}));

describe('createAttendee 함수 테스트', () => {
  let consoleErrorSpy;

  // 각 테스트 전에 모킹된 함수들을 초기화하고 console.error를 모킹
  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  // 각 테스트 후에 console.error 원래대로 복구
  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('성공적으로 참석자를 생성해야 합니다', async () => {
    const title = '테스트 회의';
    const meetingId = 'meeting123';
    const attendeeName = '참석자1';
    const userEmail = 'test@example.com';
    const teamId = 'team123';
    const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
    const fakeAttendeeInfo = { Attendee: { AttendeeId: 'attendee123' } };

    uuid.mockReturnValue(fakeUuid);
    chimeSDKMeetings.createAttendee.mockResolvedValue(fakeAttendeeInfo);
    putAttendee.mockResolvedValue();

    const result = await createAttendee(title, meetingId, attendeeName, userEmail, teamId);

    expect(uuid).toHaveBeenCalled();
    expect(chimeSDKMeetings.createAttendee).toHaveBeenCalledWith({
      MeetingId: meetingId,
      ExternalUserId: fakeUuid,
    });
    // putAttendee는 title, AttendeeId, attendeeName, userEmail, teamId 순서로 호출
    expect(putAttendee).toHaveBeenCalledWith(title, fakeAttendeeInfo.Attendee.AttendeeId, attendeeName, userEmail, teamId);
    expect(result).toBe(fakeAttendeeInfo);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('Meeting not found 오류를 처리해야 합니다', async () => {
    const title = '테스트 회의';
    const meetingId = 'invalidMeetingId';
    const attendeeName = '참석자1';
    const userEmail = 'test@example.com';
    const teamId = 'team123';
    const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
    const error = new Error('Meeting not found');

    uuid.mockReturnValue(fakeUuid);
    chimeSDKMeetings.createAttendee.mockRejectedValue(error);

    // 코드에서는 '회의를 찾을 수 없습니다.' 를 던지고 있으므로 테스트도 동일한 메시지를 기대
    await expect(createAttendee(title, meetingId, attendeeName, userEmail, teamId)).rejects.toThrow('회의를 찾을 수 없습니다.');

    expect(uuid).toHaveBeenCalled();
    expect(chimeSDKMeetings.createAttendee).toHaveBeenCalledWith({
      MeetingId: meetingId,
      ExternalUserId: fakeUuid,
    });
    expect(putAttendee).not.toHaveBeenCalled();

    // 코드에서 console.error('참가자 생성 중 오류 발생:', error) 형태로 에러 로그를 남기므로 해당 메시지로 검증
    expect(consoleErrorSpy).toHaveBeenCalledWith('참가자 생성 중 오류 발생:', error);
  });

  test('일반적인 오류를 처리해야 합니다', async () => {
    const title = '테스트 회의';
    const meetingId = 'meeting123';
    const attendeeName = '참석자1';
    const userEmail = 'test@example.com';
    const teamId = 'team123';
    const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
    const error = new Error('Some other error');

    uuid.mockReturnValue(fakeUuid);
    chimeSDKMeetings.createAttendee.mockRejectedValue(error);

    // 코드에서는 '참가자 생성에 실패하였습니다: Some other error' 형태로 던지므로 동일하게 기대
    await expect(createAttendee(title, meetingId, attendeeName, userEmail, teamId)).rejects.toThrow('참가자 생성에 실패하였습니다: Some other error');

    expect(uuid).toHaveBeenCalled();
    expect(chimeSDKMeetings.createAttendee).toHaveBeenCalledWith({
      MeetingId: meetingId,
      ExternalUserId: fakeUuid,
    });
    expect(putAttendee).not.toHaveBeenCalled();
    expect(consoleErrorSpy).toHaveBeenCalledWith('참가자 생성 중 오류 발생:', error);
  });
});
