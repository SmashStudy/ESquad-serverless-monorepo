/**
 * EventBridge 이벤트를 처리하는 Lambda 핸들러
 * @param {Object} event - EventBridge에서 전달된 이벤트 객체
 * @returns {Object} - 응답 객체
 */
export const handler = async (event) => {
  try {
    // 이벤트 로깅
    console.log('Received Event:', JSON.stringify(event, null, 2));

    // 이벤트 처리 로직을 여기에 추가
    // 예: 특정 이벤트 유형에 따라 다른 작업 수행
    // if (event['detail-type'] === 'SomeEventType') {
    //   // 처리 로직
    // }

    // 성공적인 응답 반환
    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Event processed successfully' }),
    };
  } catch (error) {
    // 오류 로깅
    console.error('Error processing event:', error);

    // 오류 응답 반환
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: error.message,
      }),
    };
  }
};
