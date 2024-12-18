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
    body: JSON.stringify({ message: 'SQS 레코드가 성공적으로 처리되었습니다.' }),
    isBase64Encoded: false,
  };

  try {
    // 이벤트 로깅 (디버깅 용도)
    console.log('수신된 SQS 이벤트:', JSON.stringify(event, null, 2));

    // 이벤트 레코드 검증
    if (!event.Records || !Array.isArray(event.Records)) {
      console.error('잘못된 이벤트 구조: Records가 없거나 배열이 아닙니다.');
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: '잘못된 이벤트 구조: Records가 없거나 배열이 아닙니다.',
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
          console.warn('레코드에 body가 없습니다:', record);
          continue; // 다음 레코드로 이동
        }

        const messageBody = JSON.parse(record.body);

        console.log('처리된 메시지:', messageBody);
      } catch (recordError) {
        // 개별 레코드 처리 중 발생한 오류 로깅
        console.error('레코드 처리 중 오류 발생:', recordError, record);
        // 필요에 따라 SQS 메시지를 다시 시도하도록 할 수 있습니다.
      }
    }

    // 성공적인 응답 반환
    return response;
  } catch (error) {
    // 전체 핸들러 처리 중 발생한 오류 로깅
    console.error('SQS 이벤트 처리 중 오류 발생:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: '서버 내부 오류가 발생했습니다.',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined,
      }),
      isBase64Encoded: false,
    };
  }
};
