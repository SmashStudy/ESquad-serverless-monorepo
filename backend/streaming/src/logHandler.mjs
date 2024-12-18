import { CloudWatchLogs } from '@aws-sdk/client-cloudwatch-logs';
import { ensureLogStream } from './logStreamManager.mjs';

/**
 * Lambda 핸들러 함수
 * @param {Object} event - Lambda 이벤트 객체
 * @returns {Object} - 응답 객체
 */
export const handler = async (event) => {
  // 기본 응답 객체 초기화
  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: '로그가 성공적으로 처리되었습니다.' }),
    isBase64Encoded: false,
  };

  try {
    // 이벤트 로깅 (디버깅 용도)
    console.log('수신된 이벤트:', JSON.stringify(event, null, 2));

    // 이벤트 본문 파싱
    if (!event.body) {
      throw new Error('이벤트 본문이 누락되었습니다.');
    }

    const body = JSON.parse(event.body);

    // 필수 파라미터 검증
    if (!body.logs || !body.appName || !body.timestamp) {
      response.body = JSON.stringify({ message: '필수 파라미터가 누락되었습니다.' });
      response.statusCode = 400;
      return response;
    }

    // 로그 스트림 이름 생성
    const logStreamName = `ChimeReactSDKMeeting_${body.timestamp}`;

    // CloudWatch Logs 클라이언트 초기화
    const cloudWatchClient = new CloudWatchLogs({ apiVersion: '2014-03-28', region: 'us-east-1' });

    // 로그 스트림 보장 및 시퀀스 토큰 획득
    let uploadSequence;
    try {
      uploadSequence = await ensureLogStream(logStreamName);
    } catch (error) {
      console.error(`로그 스트림 "${logStreamName}" 보장 중 오류 발생:`, error);
      throw new Error('로그 스트림을 보장하는 데 실패했습니다.');
    }

    // 로그 이벤트 포맷팅
    const logEvents = body.logs.map((log) => ({
      message: `${body.appName} ${new Date(log.timestampMs).toISOString()} [${log.sequenceNumber}] [${log.logLevel}]: ${log.message}`,
      timestamp: log.timestampMs,
    }));

    // 로그 이벤트 업로드
    try {
      await cloudWatchClient.putLogEvents({
        logGroupName: process.env.BROWSER_LOG_GROUP_NAME,
        logStreamName,
        logEvents,
        ...(uploadSequence && { sequenceToken: uploadSequence }),
      });
    } catch (error) {
      console.error('CloudWatch에 로그 이벤트 업로드 중 오류 발생:', error);
      throw new Error('로그 이벤트 업로드에 실패했습니다.');
    }

    // 성공적인 응답 반환
    return response;
  } catch (error) {
    // 오류 로깅
    console.error('로그 처리 중 오류 발생:', error);

    // 오류 응답 객체 생성
    const errorResponse = {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: '서버 내부 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? error.message : '예기치 않은 오류가 발생했습니다.',
      }),
      isBase64Encoded: false,
    };

    // 오류 응답 반환
    return errorResponse;
  }
};
