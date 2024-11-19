import { ChimeSDKMeetings } from '@aws-sdk/client-chime-sdk-meetings';

// 환경 변수에서 필요한 값을 가져옵니다.
const sqsQueueArn = process.env.SQS_QUEUE_ARN;
const useEventBridge = process.env.USE_EVENT_BRIDGE === 'false';

// 필수 환경 변수 검증
if (!useEventBridge && !sqsQueueArn) {
  throw new Error('SQS_QUEUE_ARN 환경 변수가 필요하지만 설정되어 있지 않습니다.');
}

let chimeSDKMeetings;
try {
  chimeSDKMeetings = new ChimeSDKMeetings({ region: 'us-east-1' });
} catch (error) {
  console.error('ChimeSDKMeetings 클라이언트 초기화 중 오류 발생:', error);
  throw new Error('ChimeSDKMeetings 클라이언트를 초기화할 수 없습니다.');
}

/**
 * UUID를 생성하는 함수
 * @returns {string} - 생성된 UUID
 */
export const uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

/**
 * 알림 설정을 반환하는 함수
 * @returns {Object} - 알림 설정 객체
 * @throws {Error} - 필요한 환경 변수가 설정되지 않은 경우
 */
export const getNotificationsConfig = () => {
  try {
    if (useEventBridge) {
      return {}; // EventBridge 사용 시 빈 객체 반환
    }

    if (!sqsQueueArn) {
      throw new Error('SQS_QUEUE_ARN 환경 변수가 필요하지만 설정되어 있지 않습니다.');
    }

    return { SqsQueueArn: sqsQueueArn };
  } catch (error) {
    console.error('알림 설정을 가져오는 중 오류 발생:', error);
    throw new Error('알림 설정을 가져올 수 없습니다.');
  }
};

export { chimeSDKMeetings };
