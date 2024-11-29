import { chimeSDKMeetings } from './chimeMeetingsClient.mjs';
import { putAttendee } from './putAttendee.mjs';
import { uuid } from './uuidGenerator.mjs';

export const createAttendee = async (title, meetingId, attendeeName) => {
  try {
    // 참가자 생성
    const attendeeInfo = await chimeSDKMeetings.createAttendee({
      MeetingId: meetingId,
      ExternalUserId: uuid(),
    });

    // 참석자 정보 저장
    await putAttendee(title, attendeeInfo.Attendee.AttendeeId, attendeeName);
    
    return attendeeInfo;
  } catch (error) {
    // 예외 처리
    console.error('Error creating attendee:', error);

    if (error.message.includes('Meeting not found')) {
      throw new Error('Meeting not found');  // 회의가 존재하지 않는 경우
    }

    throw new Error('Failed to create attendee: ' + error.message); // 일반적인 오류 처리
  }
};
