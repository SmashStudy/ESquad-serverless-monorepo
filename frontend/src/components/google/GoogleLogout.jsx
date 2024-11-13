import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { COGNITO_CONFIG } from './Config.js';

const GoogleLogout = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const { domain, clientId, logoutRedirectUri } = COGNITO_CONFIG;
        const logoutUrl = `https://${domain}/logout?client_id=${clientId}&logout_uri=${logoutRedirectUri}`;

        // 로컬 저장소에서 JWT 토큰 삭제
        localStorage.removeItem('jwtToken');

        // 로그아웃 URL로 이동
        window.location.href = logoutUrl;
        
    }, []);

    return <div>로그아웃 중...</div>;
};

export default GoogleLogout;
