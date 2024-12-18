/**
 * EventBridge 이벤트를 처리하는 Lambda 핸들러
 * @param {Object} event - EventBridge에서 전달된 이벤트 객체
 * @returns {Object} - 응답 객체
 */
export const handler = async (event) => {
  try {
    // 이벤트 로깅
    console.log('수신된 이벤트:', JSON.stringify(event, null, 2));

    // 성공적인 응답 반환
    return {
      statusCode: 200,
      body: JSON.stringify({ message: '이벤트가 성공적으로 처리되었습니다.' }),
    };
  } catch (error) {
    // 오류 로깅
    console.error('이벤트 처리 중 오류 발생:', error);

    // 오류 응답 반환
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: '내부 서버 오류가 발생했습니다.',
        error: error.message,
      }),
    };
  }
};
