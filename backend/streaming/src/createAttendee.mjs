import { chimeSDKMeetings } from './chimeMeetingsClient.mjs';
import { putAttendee } from './putAttendee.mjs';
import { uuid } from './uuidGenerator.mjs';

export const createAttendee = async (title, meetingId, attendeeName, userEmail, teamId) => {
  try {
    // 참가자 생성
    const attendeeInfo = await chimeSDKMeetings.createAttendee({
      MeetingId: meetingId,
      ExternalUserId: uuid(),
    });

    // 참석자 정보 저장
    await putAttendee(title, attendeeInfo.Attendee.AttendeeId, attendeeName, userEmail, teamId);
    
    return attendeeInfo;
  } catch (error) {
    // 예외 처리
    console.error('참가자 생성 중 오류 발생:', error);

    if (error.message.includes('Meeting not found')) {
      throw new Error('회의를 찾을 수 없습니다.'); // 회의가 존재하지 않는 경우
    }

    throw new Error('참가자 생성에 실패하였습니다: ' + error.message); // 일반적인 오류 처리
  }
};
