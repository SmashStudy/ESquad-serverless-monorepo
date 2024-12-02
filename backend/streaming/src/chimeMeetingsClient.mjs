import { ChimeSDKMeetings } from '@aws-sdk/client-chime-sdk-meetings';


let chimeSDKMeetings;
try {
  chimeSDKMeetings = new ChimeSDKMeetings({ region: 'us-east-1' });
} catch (error) {
  console.error('ChimeSDKMeetings 클라이언트 초기화 중 오류 발생:', error);
  throw new Error('ChimeSDKMeetings 클라이언트를 초기화할 수 없습니다.');
}

export { chimeSDKMeetings };