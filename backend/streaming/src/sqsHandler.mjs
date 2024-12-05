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
    console.log('Received SQS Event:', JSON.stringify(event, null, 2));

    // 이벤트 레코드 검증
    if (!event.Records || !Array.isArray(event.Records)) {
      console.error('Invalid event structure: Records are missing or not an array.');
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Invalid event structure: Records are missing or not an array.',
        }),
        isBase64Encoded: false,
      };
    }

    const records = event.Records;

    // 각 레코드 처리
    for (const record of records) {
      try {
        // 레코드 검증
        if (!record.body) {
          console.warn('Record is missing body:', record);
          continue; // 다음 레코드로 이동
        }

        const messageBody = JSON.parse(record.body);

        // 메시지 처리 로직을 여기에 추가
        // 예: 특정 필드 기반으로 작업 수행
        // if (messageBody.type === 'SomeType') {
        //   // 처리 로직
        // }

        console.log('Processed message:', messageBody);
      } catch (recordError) {
        // 개별 레코드 처리 중 발생한 오류 로깅
        console.error('Error processing record:', recordError, record);
        // 필요에 따라 SQS 메시지를 다시 시도하도록 할 수 있습니다.
      }
    }

    // 성공적인 응답 반환
    return response;
  } catch (error) {
    // 전체 핸들러 처리 중 발생한 오류 로깅
    console.error('Error processing SQS event:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      }),
      isBase64Encoded: false,
    };
  }
};
