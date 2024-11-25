import { createMeeting } from '../service/createMeeting.mjs';
import { chimeSDKMeetings } from '../service/chimeMeetingsClient.mjs';
import { uuid } from '../service/uuidGenerator.mjs';
import { getNotificationsConfig } from '../service/getNotificationsConfig.mjs';
import { putMeeting } from '../service/putMeeting.mjs';

// Jest를 사용하여 모듈 모킹
jest.mock('../service/chimeMeetingsClient.mjs', () => ({
  chimeSDKMeetings: {
    createMeeting: jest.fn(),
  },
}));

jest.mock('../service/uuidGenerator.mjs', () => ({
  uuid: jest.fn(),
}));

jest.mock('../service/getNotificationsConfig.mjs', () => ({
  getNotificationsConfig: jest.fn(),
}));

jest.mock('../service/putMeeting.mjs', () => ({
  putMeeting: jest.fn(),
}));

describe('createMeeting 함수 테스트', () => {
  let consoleErrorSpy;

  // 각 테스트 전에 모킹된 함수들을 초기화
  beforeEach(() => {
    jest.clearAllMocks();
    // console.error를 모킹하여 테스트 중에 출력되지 않도록 함
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  // 각 테스트 후에 console.error 원래대로 복구
  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('성공적으로 회의를 생성해야 합니다', async () => {
    const title = '테스트 회의';
    const region = 'us-east-1';
    const ns_es = 'true';
    const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
    const fakeNotificationsConfig = { /* 알림 설정 객체 */ };
    const fakeMeetingInfo = { Meeting: { MeetingId: 'meeting123' } };

    // 모킹된 함수들의 반환 값 설정
    uuid.mockReturnValue(fakeUuid);
    getNotificationsConfig.mockReturnValue(fakeNotificationsConfig);
    chimeSDKMeetings.createMeeting.mockResolvedValue(fakeMeetingInfo);
    putMeeting.mockResolvedValue();

    // 함수 호출
    const result = await createMeeting(title, region, ns_es);

    // 호출 여부 및 인자 검증
    expect(uuid).toHaveBeenCalled();
    expect(getNotificationsConfig).toHaveBeenCalled();
    expect(chimeSDKMeetings.createMeeting).toHaveBeenCalledWith({
      ClientRequestToken: fakeUuid,
      MediaRegion: region,
      NotificationsConfiguration: fakeNotificationsConfig,
      ExternalMeetingId: title.substring(0, 64),
      MeetingFeatures: { Audio: { EchoReduction: 'AVAILABLE' } },
    });
    expect(putMeeting).toHaveBeenCalledWith(title, fakeMeetingInfo);
    expect(result).toBe(fakeMeetingInfo);
    // console.error가 호출되지 않았는지 검증
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('BadRequestException 오류를 처리해야 합니다', async () => {
    const title = '테스트 회의';
    const region = 'us-east-1';
    const ns_es = 'false';
    const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
    const fakeNotificationsConfig = { /* 알림 설정 객체 */ };
    const error = new Error('BadRequestException: Invalid input');

    uuid.mockReturnValue(fakeUuid);
    getNotificationsConfig.mockReturnValue(fakeNotificationsConfig);
    chimeSDKMeetings.createMeeting.mockRejectedValue(error);

    // 오류 발생 여부 및 메시지 검증
    await expect(createMeeting(title, region, ns_es)).rejects.toThrow('Invalid request to create meeting');

    // 호출 여부 및 인자 검증
    expect(uuid).toHaveBeenCalled();
    expect(getNotificationsConfig).toHaveBeenCalled();
    expect(chimeSDKMeetings.createMeeting).toHaveBeenCalledWith({
      ClientRequestToken: fakeUuid,
      MediaRegion: region,
      NotificationsConfiguration: fakeNotificationsConfig,
      ExternalMeetingId: title.substring(0, 64),
      MeetingFeatures: undefined,
    });
    expect(putMeeting).not.toHaveBeenCalled();
    // console.error가 호출되었는지 검증
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating meeting:', error);
  });

  test('ServiceUnavailable 오류를 처리해야 합니다', async () => {
    const title = '테스트 회의';
    const region = 'us-east-1';
    const ns_es = 'false';
    const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
    const fakeNotificationsConfig = { /* 알림 설정 객체 */ };
    const error = new Error('ServiceUnavailable: Chime service is down');

    uuid.mockReturnValue(fakeUuid);
    getNotificationsConfig.mockReturnValue(fakeNotificationsConfig);
    chimeSDKMeetings.createMeeting.mockRejectedValue(error);

    // 오류 발생 여부 및 메시지 검증
    await expect(createMeeting(title, region, ns_es)).rejects.toThrow('Chime service unavailable, try again later');

    // 호출 여부 및 인자 검증
    expect(uuid).toHaveBeenCalled();
    expect(getNotificationsConfig).toHaveBeenCalled();
    expect(chimeSDKMeetings.createMeeting).toHaveBeenCalledWith({
      ClientRequestToken: fakeUuid,
      MediaRegion: region,
      NotificationsConfiguration: fakeNotificationsConfig,
      ExternalMeetingId: title.substring(0, 64),
      MeetingFeatures: undefined,
    });
    expect(putMeeting).not.toHaveBeenCalled();
    // console.error가 호출되었는지 검증
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating meeting:', error);
  });

  test('기타 오류를 처리해야 합니다', async () => {
    const title = '테스트 회의';
    const region = 'us-east-1';
    const ns_es = 'false';
    const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
    const fakeNotificationsConfig = { /* 알림 설정 객체 */ };
    const error = new Error('Some other error');

    uuid.mockReturnValue(fakeUuid);
    getNotificationsConfig.mockReturnValue(fakeNotificationsConfig);
    chimeSDKMeetings.createMeeting.mockRejectedValue(error);

    // 오류 발생 여부 및 메시지 검증
    await expect(createMeeting(title, region, ns_es)).rejects.toThrow('Failed to create meeting: Some other error');

    // 호출 여부 및 인자 검증
    expect(uuid).toHaveBeenCalled();
    expect(getNotificationsConfig).toHaveBeenCalled();
    expect(chimeSDKMeetings.createMeeting).toHaveBeenCalledWith({
      ClientRequestToken: fakeUuid,
      MediaRegion: region,
      NotificationsConfiguration: fakeNotificationsConfig,
      ExternalMeetingId: title.substring(0, 64),
      MeetingFeatures: undefined,
    });
    expect(putMeeting).not.toHaveBeenCalled();
    // console.error가 호출되었는지 검증
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error creating meeting:', error);
  });
});
