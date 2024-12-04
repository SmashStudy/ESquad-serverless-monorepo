import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { initializeCognitoConfig, getCognitoConfig } from '../../../utils/user/Config.js';

const Logout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // 로딩 상태 관리

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Cognito 환경 변수 초기화
        await initializeCognitoConfig();
        const { domain, clientId, logoutRedirectUri } = getCognitoConfig();

        // 로그아웃 URL 생성
        const logoutUrl = `https://${domain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(
          logoutRedirectUri
        )}`;

        // 로컬 저장소에서 JWT 토큰 삭제
        localStorage.removeItem('jwtToken');

        // 로그아웃 URL로 이동
        window.location.href = logoutUrl;
      } catch (error) {
        console.error('로그아웃 처리 중 오류 발생:', error);
        navigate('/error'); // 오류 시 에러 페이지로 이동
      } finally {
        setLoading(false); // 로딩 상태 종료
      }
    };

    handleLogout();
  }, [navigate]);

  return null; // 모든 처리가 끝나면 컴포넌트 렌더링 없음
};

export default Logout;
