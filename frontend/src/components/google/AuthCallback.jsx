// src/AuthCallback.jsx
import React, { useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { COGNITO_CONFIG } from './Config.js';

const AuthCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const exchangeCodeForToken = async (code) => {
            try {
                const { clientId, redirectUri, domain } = COGNITO_CONFIG;

                // 토큰 교환을 위한 요청 데이터
                const params = new URLSearchParams({
                    grant_type: 'authorization_code',
                    client_id: clientId,
                    redirect_uri: redirectUri,
                    code,
                });

                // 토큰 교환 요청
                const response = await axios.post(
                    `https://${domain}/oauth2/token`,
                    params,
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    }
                );

                const { id_token } = response.data;

                if (id_token) {
                    // JWT 토큰을 로컬 저장소에 저장
                    localStorage.setItem('jwtToken', id_token);
                    console.log('JWT 토큰이 로컬 저장소에 저장되었습니다.');

                    // 메인 페이지로 이동
                    navigate('/');
                }

            } catch (error) {
                console.error('Error exchanging code for token:', error);
            }
        };

        // URL에서 인증 코드 추출
        const code = new URLSearchParams(location.search).get('code');
        if (code) {
            exchangeCodeForToken(code);
        }
    }, [location, navigate]);

    return <div>로그인 처리 중...</div>;
};

export default AuthCallback;
