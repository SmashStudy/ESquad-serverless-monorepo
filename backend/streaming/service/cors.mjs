export const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "https://live.dev.esquad.click", // 특정 도메인 허용
    "Access-Control-Allow-Credentials": true, // 필요 시 true로 설정
    "Access-Control-Allow-Headers": "Content-Type, Authorization", // 필요한 헤더 추가
    "Access-Control-Allow-Methods": "OPTIONS,POST,GET" // 허용할 메소드
  };
  
  /**
   * OPTIONS 요청에 대한 응답을 생성하는 함수
   * @returns {Object} - CORS 헤더가 포함된 응답 객체
   */
  export const handleOptions = () => ({
    statusCode: 200,
    headers: CORS_HEADERS,
    body: ''
  });