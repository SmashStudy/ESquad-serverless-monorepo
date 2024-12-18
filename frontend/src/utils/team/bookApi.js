import axios from 'axios';
import { getTeamApi } from '../apiConfig';

// 공통 헤더 설정
const getAuthHeaders = () => ({
    headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`, // 로컬스토리지에서 JWT 토큰 가져오기
    },
});

// 도서 검색 API 호출 함수
export const searchBooks = async (query) => {
    if (!query.trim()) {
        throw new Error("검색어가 비어있습니다."); // 예외 처리
    }

    const endpoint = `${getTeamApi()}/book/search`;
    try {
        const response = await axios.get(endpoint, {
            params: { query },
            ...getAuthHeaders(),
        });
        return response.data; // 응답 데이터 반환
    } catch (error) {
        console.error("도서 검색 중 오류 발생:", error);
        throw error; // 예외 전달
    }
};