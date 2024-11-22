import { chimeSDKMeetings } from './chimeMeetingsClient.mjs';
import { getMeeting } from './getMeeting.mjs';

export const deleteMeeting = async (title) => {
  try {
    // 회의 정보 조회
    const meetingInfo = await getMeeting(title);

    // 회의가 존재하지 않는 경우
    if (!meetingInfo) {
      throw new Error('Meeting not found');
    }

    // 회의 삭제 요청
    await chimeSDKMeetings.deleteMeeting({ MeetingId: meetingInfo.Meeting.MeetingId });

    return { message: 'Meeting deleted successfully' };
  } catch (error) {
    // 예외 처리
    console.error('Error deleting meeting:', error);

    // 회의가 존재하지 않는 경우 처리
    if (error.message === 'Meeting not found') {
      throw new Error('Meeting not found');
    }

    // Chime SDK 관련 에러 메시지 처리
    if (error.message.includes('BadRequestException')) {
      throw new Error('Invalid request to delete meeting');
    }

    if (error.message.includes('ServiceUnavailable')) {
      throw new Error('Chime service unavailable, try again later');
    }

    // 그 외의 일반적인 오류 처리
    throw new Error('Failed to delete meeting: ' + error.message);
  }
};
