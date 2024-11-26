import { createAttendee } from '../service/createAttendee.mjs';
import { chimeSDKMeetings } from '../service/chimeMeetingsClient.mjs';
import { uuid } from '../service/uuidGenerator.mjs';
import { putAttendee } from '../service/putAttendee.mjs';

// Jest를 사용하여 모듈 모킹
jest.mock('../service/chimeMeetingsClient.mjs', () => ({
  chimeSDKMeetings: {
    createAttendee: jest.fn(),
  },
}));

jest.mock('../service/uuidGenerator.mjs', () => ({
  uuid: jest.fn(),
}));

jest.mock('../service/putAttendee.mjs', () => ({
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
    const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
    const fakeAttendeeInfo = { Attendee: { AttendeeId: 'attendee123' } };

    // 모킹된 함수들의 반환 값 설정
    uuid.mockReturnValue(fakeUuid);
    chimeSDKMeetings.createAttendee.mockResolvedValue(fakeAttendeeInfo);
    putAttendee.mockResolvedValue();

    // 함수 호출
    const result = await createAttendee(title, meetingId, attendeeName);

    // 호출 여부 및 인자 검증
    expect(uuid).toHaveBeenCalled();
    expect(chimeSDKMeetings.createAttendee).toHaveBeenCalledWith({
      MeetingId: meetingId,
      ExternalUserId: fakeUuid,
    });
    expect(putAttendee).toHaveBeenCalledWith(title, fakeAttendeeInfo.Attendee.AttendeeId, attendeeName);
    expect(result).toBe(fakeAttendeeInfo);

    // console.error가 호출되지 않았는지 검증
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('Meeting not found 오류를 처리해야 합니다', async () => {
    const title = '테스트 회의';
    const meetingId = 'invalidMeetingId';
    const attendeeName = '참석자1';
    const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
    const error = new Error('Meeting not found');

    // 모킹된 함수들의 반환 값 설정
    uuid.mockReturnValue(fakeUuid);
    chimeSDKMeetings.createAttendee.mockRejectedValue(error);

    // 오류 발생 여부 및 메시지 검증
    await expect(createAttendee(title, meetingId, attendeeName)).rejects.toThrow('Meeting not found');

    // 호출 여부 및 인자 검증
    expect(uuid).toHaveBeenCalled();
    expect(chimeSDKMeetings.createAttendee).toHaveBeenCalledWith({
      MeetingId: meetingId,
      ExternalUserId: fakeUuid,
    });
    expect(putAttendee).not.toHaveBeenCalled();

    // console.error가 호출되었는지 검증
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating attendee:', error);
  });

  test('일반적인 오류를 처리해야 합니다', async () => {
    const title = '테스트 회의';
    const meetingId = 'meeting123';
    const attendeeName = '참석자1';
    const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
    const error = new Error('Some other error');

    // 모킹된 함수들의 반환 값 설정
    uuid.mockReturnValue(fakeUuid);
    chimeSDKMeetings.createAttendee.mockRejectedValue(error);

    // 오류 발생 여부 및 메시지 검증
    await expect(createAttendee(title, meetingId, attendeeName)).rejects.toThrow('Failed to create attendee: Some other error');

    // 호출 여부 및 인자 검증
    expect(uuid).toHaveBeenCalled();
    expect(chimeSDKMeetings.createAttendee).toHaveBeenCalledWith({
      MeetingId: meetingId,
      ExternalUserId: fakeUuid,
    });
    expect(putAttendee).not.toHaveBeenCalled();

    // console.error가 호출되었는지 검증
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating attendee:', error);
  });
});
