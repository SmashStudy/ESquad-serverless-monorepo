import { CloudWatchLogs } from '@aws-sdk/client-cloudwatch-logs';

/**
 * 필수 환경 변수 검증
 */
const logGroupName = process.env.BROWSER_LOG_GROUP_NAME;

if (!logGroupName) {
  throw new Error('필수 환경 변수 BROWSER_LOG_GROUP_NAME이 설정되어 있지 않습니다.');
}

/**
 * 로그 스트림을 보장하고, 존재할 경우 시퀀스 토큰을 반환하는 함수
 * @param {string} logStreamName - 보장할 로그 스트림 이름
 * @returns {string|null} - 시퀀스 토큰 또는 null
 * @throws {Error} - CloudWatch Logs 관련 오류 발생 시
 */
export const ensureLogStream = async (logStreamName) => {
  // CloudWatch Logs 클라이언트 초기화
  const cloudWatchClient = new CloudWatchLogs({ apiVersion: '2014-03-28', region: 'us-east-1' });

  try {
    // 로그 스트림 존재 여부 확인
    const describeLogStreamsParams = {
      logGroupName: logGroupName,
      logStreamNamePrefix: logStreamName,
    };

    const response = await cloudWatchClient.describeLogStreams(describeLogStreamsParams);

    // 로그 스트림 찾기
    const foundStream = response.logStreams.find((s) => s.logStreamName === logStreamName);

    if (foundStream) {
      return foundStream.uploadSequenceToken;
    }

    // 로그 스트림이 존재하지 않으면 생성
    await cloudWatchClient.createLogStream({
      logGroupName: logGroupName,
      logStreamName: logStreamName,
    });

    return null;
  } catch (error) {
    console.error(`로그 스트림 "${logStreamName}"을 보장하는 중 오류 발생:`, error);
    throw new Error('CloudWatch Logs에서 로그 스트림을 보장하는 데 실패했습니다.');
  }
};
