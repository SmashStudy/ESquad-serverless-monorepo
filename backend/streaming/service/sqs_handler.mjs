import { ValidationError, ProcessingError } from './errors.mjs';
import logger from './logger.mjs'; // 예: winston 설정된 로거

/**
 * Lambda 핸들러 함수
 * @param {Object} event - SQS에서 전달된 이벤트 객체
 * @returns {Object} - 응답 객체
 */
export const handler = async (event) => {
  // 기본 응답 객체 초기화
  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: 'SQS records processed successfully.' }),
    isBase64Encoded: false,
  };

  try {
    // 이벤트 로깅 (디버깅 용도)
    logger.info('Received SQS Event', { event });

    // 이벤트 레코드 검증
    if (!event.Records || !Array.isArray(event.Records)) {
      throw new ValidationError('Invalid event structure: Records are missing or not an array.');
    }

    const records = event.Records;

    // 각 레코드 처리
    for (const record of records) {
      try {
        // 레코드 검증
        if (!record.body) {
          logger.warn('Record is missing body:', { record });
          continue; // 다음 레코드로 이동
        }

        const messageBody = JSON.parse(record.body);

        // 메시지 처리 로직을 여기에 추가
        // 예: 특정 필드 기반으로 작업 수행
        // if (messageBody.type === 'SomeType') {
        //   // 처리 로직
        // }

        logger.info('Processed message', { messageBody });
      } catch (recordError) {
        // 개별 레코드 처리 중 발생한 오류 로깅
        logger.error('Error processing record:', { error: recordError, record });
        // 필요에 따라 SQS 메시지를 다시 시도하도록 할 수 있습니다.
        // throw new ProcessingError('Failed to process a record.'); // 전체 핸들러를 실패시키려면 주석 해제
      }
    }

    // 성공적인 응답 반환
    return response;
  } catch (error) {
    // 전체 핸들러 처리 중 발생한 오류 로깅
    logger.error('Error processing SQS event:', { error });

    let statusCode = 500;
    let message = 'Internal Server Error';

    if (error instanceof ValidationError) {
      statusCode = 400;
      message = error.message;
    } else if (error instanceof ProcessingError) {
      statusCode = 500;
      message = 'Failed to process logs.';
    }

    const errorResponse = {
      statusCode,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      }),
      isBase64Encoded: false,
    };

    // 오류 응답 반환
    return errorResponse;
  }
};
