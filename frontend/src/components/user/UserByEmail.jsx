import axios from 'axios';
import {getUserApi} from "../../utils/apiConfig.js";
// Lambda 함수의 API Gateway 엔드포인트 URL
const API_URL = `${getUserApi()}/get-user`;

export const UserByEmail = async (email) => {
  try {
    // 이메일 유효성 검사
    if (!email || typeof email !== "string" || !email.includes("@")) {
      throw new Error("유효한 이메일을 입력해주세요.");
    }

    // API 요청
    const response = await axios.post(API_URL, { email });

    // 응답 처리
    if (response.status === 200) {
      return response.data;
    } else {
      throw new Error(`서버 응답 상태 코드: ${response.status}`);
    }
  } catch (error) {
    console.error("사용자 정보를 가져오는 중 오류 발생:", error.message);
    throw error;
  }
};
