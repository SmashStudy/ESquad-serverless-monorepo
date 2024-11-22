import fs from 'fs';

/**
 * Lambda 핸들러 함수
 * @param {Object} event - 이벤트 데이터
 * @param {Object} context - 실행 환경 정보
 * @param {Function} callback - 콜백 함수
 */
export const handler = async (event, context, callback) => {
  // 기본 응답 객체 초기화
  const response = {
    statusCode: 200,
    headers: {
      'Content-Type': 'text/html',
    },
    body: '',
    isBase64Encoded: false,
  };

  try {
    // 파일 읽기 (동기식)
    response.body = fs.readFileSync('./index.html', { encoding: 'utf8' });

    // 성공적인 응답 반환
    callback(null, response);
  } catch (error) {
    // 오류 로깅
    console.error('Error reading index.html:', error);

    // 오류 응답 객체 생성
    const errorResponse = {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: 'Unable to read the requested file.',
      }),
      isBase64Encoded: false,
    };

    // 오류 응답 반환
    callback(null, errorResponse);
  }
};
