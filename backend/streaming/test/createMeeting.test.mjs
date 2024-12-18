import { createMeeting } from '../src/createMeeting.mjs';
import { chimeSDKMeetings } from '../src/chimeMeetingsClient.mjs';
import { uuid } from '../src/uuidGenerator.mjs';
import { getNotificationsConfig } from '../src/getNotificationsConfig.mjs';
import { putMeeting } from '../src/putMeeting.mjs';

// Jest를 사용하여 모듈 모킹
jest.mock('../src/chimeMeetingsClient.mjs', () => ({
  chimeSDKMeetings: {
    createMeeting: jest.fn(),
  },
}));

jest.mock('../src/uuidGenerator.mjs', () => ({
  uuid: jest.fn(),
}));

jest.mock('../src/getNotificationsConfig.mjs', () => ({
  getNotificationsConfig: jest.fn(),
}));

jest.mock('../src/putMeeting.mjs', () => ({
  putMeeting: jest.fn(),
}));

describe('createMeeting 함수 테스트', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('성공적으로 회의를 생성해야 합니다', async () => {
    const title = '테스트 회의';
    const attendeeName = 'testAttendee';
    const region = 'us-east-1';
    const ns_es = 'true';
    const userEmail = 'test@example.com';
    const teamId = 'team123';
    const status = 'active';

    const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
    const fakeNotificationsConfig = {};
    const fakeMeetingInfo = { Meeting: { MeetingId: 'meeting123' } };

    uuid.mockReturnValue(fakeUuid);
    getNotificationsConfig.mockReturnValue(fakeNotificationsConfig);
    chimeSDKMeetings.createMeeting.mockResolvedValue(fakeMeetingInfo);
    putMeeting.mockResolvedValue();

    const result = await createMeeting(title, attendeeName, region, ns_es, userEmail, teamId, status);

    expect(uuid).toHaveBeenCalled();
    expect(getNotificationsConfig).toHaveBeenCalled();
    expect(chimeSDKMeetings.createMeeting).toHaveBeenCalledWith({
      ClientRequestToken: fakeUuid,
      MediaRegion: region,
      NotificationsConfiguration: fakeNotificationsConfig,
      ExternalMeetingId: title.substring(0, 64),
      MeetingFeatures: { Audio: { EchoReduction: 'AVAILABLE' } },
    });
    expect(putMeeting).toHaveBeenCalledWith(title, attendeeName, fakeMeetingInfo, userEmail, teamId, status);
    expect(result).toBe(fakeMeetingInfo);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('BadRequestException 오류를 처리해야 합니다', async () => {
    const title = '테스트 회의';
    const attendeeName = 'testAttendee';
    const region = 'us-east-1';
    const ns_es = 'false';
    const userEmail = 'test@example.com';
    const teamId = 'team123';
    const status = 'active';

    const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
    const fakeNotificationsConfig = {};
    const error = new Error('BadRequestException: Invalid input');

    uuid.mockReturnValue(fakeUuid);
    getNotificationsConfig.mockReturnValue(fakeNotificationsConfig);
    chimeSDKMeetings.createMeeting.mockRejectedValue(error);

    await expect(createMeeting(title, attendeeName, region, ns_es, userEmail, teamId, status))
      .rejects.toThrow('회의 생성 요청이 잘못되었습니다.');

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
    expect(consoleErrorSpy).toHaveBeenCalledWith('회의 생성 중 오류 발생:', error);
  });

  test('ServiceUnavailable 오류를 처리해야 합니다', async () => {
    const title = '테스트 회의';
    const attendeeName = 'testAttendee';
    const region = 'us-east-1';
    const ns_es = 'false';
    const userEmail = 'test@example.com';
    const teamId = 'team123';
    const status = 'active';

    const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
    const fakeNotificationsConfig = {};
    const error = new Error('ServiceUnavailable: Chime service is down');

    uuid.mockReturnValue(fakeUuid);
    getNotificationsConfig.mockReturnValue(fakeNotificationsConfig);
    chimeSDKMeetings.createMeeting.mockRejectedValue(error);

    await expect(createMeeting(title, attendeeName, region, ns_es, userEmail, teamId, status))
      .rejects.toThrow('Chime 서비스가 현재 사용 불가능합니다. 잠시 후 다시 시도해주세요.');

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
    expect(consoleErrorSpy).toHaveBeenCalledWith('회의 생성 중 오류 발생:', error);
  });

  test('기타 오류를 처리해야 합니다', async () => {
    const title = '테스트 회의';
    const attendeeName = 'testAttendee';
    const region = 'us-east-1';
    const ns_es = 'false';
    const userEmail = 'test@example.com';
    const teamId = 'team123';
    const status = 'active';

    const fakeUuid = '123e4567-e89b-12d3-a456-426614174000';
    const fakeNotificationsConfig = {};
    const error = new Error('Some other error');

    uuid.mockReturnValue(fakeUuid);
    getNotificationsConfig.mockReturnValue(fakeNotificationsConfig);
    chimeSDKMeetings.createMeeting.mockRejectedValue(error);

    await expect(createMeeting(title, attendeeName, region, ns_es, userEmail, teamId, status))
      .rejects.toThrow('회의 생성에 실패했습니다: Some other error');

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
    expect(consoleErrorSpy).toHaveBeenCalledWith('회의 생성 중 오류 발생:', error);
  });
});
