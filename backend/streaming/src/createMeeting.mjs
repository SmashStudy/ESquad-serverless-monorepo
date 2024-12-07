import { chimeSDKMeetings } from './chimeMeetingsClient.mjs';
import { uuid } from './uuidGenerator.mjs';
import { getNotificationsConfig } from './getNotificationsConfig.mjs';
import { putMeeting } from './putMeeting.mjs';

export const createMeeting = async (title, attendeeName, region, ns_es, userEmail, teamId, status ) => {
  try {
    // 회의 요청 객체 준비
    const request = {
      ClientRequestToken: uuid(),
      MediaRegion: region,
      NotificationsConfiguration: getNotificationsConfig(),
      ExternalMeetingId: title.substring(0, 64),
      MeetingFeatures: ns_es === 'true' ? { Audio: { EchoReduction: 'AVAILABLE' } } : undefined,
    };

    // 회의 생성
    const meetingInfo = await chimeSDKMeetings.createMeeting(request);

    // 회의 정보 저장
    await putMeeting(title, attendeeName, meetingInfo, userEmail, teamId, status);

    // 성공적인 회의 생성 정보 반환
    return meetingInfo;
  } catch (error) {
    // 예외 처리
    console.error('Error creating meeting:', error);

    // Chime SDK 관련 에러 메시지 처리
    if (error.message.includes('BadRequestException')) {
      throw new Error('Invalid request to create meeting');
    }

    if (error.message.includes('ServiceUnavailable')) {
      throw new Error('Chime service unavailable, try again later');
    }

    // 그 외의 오류는 일반적인 오류로 처리
    throw new Error('Failed to create meeting: ' + error.message);
  }
};
