import axios from 'axios';

// 기본적으로 null로 시작하는 환경 변수 설정
export let COGNITO_CONFIG = null;

// Lambda에서 환경 변수를 가져오는 함수
const fetchCognitoConfig = async () => {
  try {
    const response = await axios.get('https://6vda3yqi4l.execute-api.us-east-1.amazonaws.com/dev/environments'); // Lambda API Gateway URL
    return response.data; // Lambda에서 반환된 환경 변수 객체
  } catch (error) {
    console.error('환경 변수 가져오기 실패:', error);
    throw new Error('환경 변수를 가져올 수 없습니다.');
  }
};

// Cognito 환경 변수를 초기화하는 함수
export const initializeCognitoConfig = async () => {
  try {
    const env = await fetchCognitoConfig(); // Lambda에서 환경 변수 가져오기

    // 환경 변수 초기화
    COGNITO_CONFIG = {
      clientId: env.VITE_COGNITO_CLIENT_ID,
      redirectUri: env.VITE_COGNITO_REDIRECT_URI,
      logoutUri: env.VITE_COGNITO_LOGOUT_URI,
      domain: env.VITE_COGNITO_DOMAIN,
      scope: env.VITE_COGNITO_SCOPE,
      responseType: env.VITE_COGNITO_RESPONSE_TYPE,
      logoutRedirectUri: env.VITE_COGNITO_LOGOUT_URI,
    };

  } catch (error) {
    console.error('Cognito Config 초기화 실패:', error);
    throw error;
  }
};

// 환경 변수를 가져오는 함수
export const getCognitoConfig = () => {
  if (!COGNITO_CONFIG) {
    throw new Error('Cognito Config가 초기화되지 않았습니다. 먼저 initializeCognitoConfig를 호출하세요.');
  }
  return COGNITO_CONFIG;
};
