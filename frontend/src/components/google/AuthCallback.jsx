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
                const params = new URLSearchParams();
                params.append('grant_type', 'authorization_code');
                params.append('client_id', clientId);
                params.append('redirect_uri', redirectUri);
                params.append('code', code);

                // 토큰 교환 요청
                const response = await axios.post(
                    `https://${domain}/oauth2/token`, // 백틱 사용
                    params,
                    {
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                        },
                    }
                );
                

                // 받은 액세스 토큰과 사용자 정보 활용
                const { id_token } = response.data;
                console.log('ID Token:', id_token);

                if (access_token) {
                    localStorage.setItem('jwtToken', id_token);
                    console.log('JWT 토큰이 로컬 저장소에 저장되었습니다.');
                    
                    // setTimeout(() => navigate('/'), 100);
                    navigate('/'); // 메인 페이지로 이동
                }

                // 액세스 토큰을 이용해 사용자 정보를 가져오거나, 메인 페이지로 이동
                

            } catch (error) {
                console.error('Error exchanging code for token:', error);
            }
        };

        // URL에서 인증 코드 추출
        const queryParams = new URLSearchParams(location.search);
        const code = queryParams.get('code');

        if (code) {
            exchangeCodeForToken(code);
        }
    }, [location, navigate]);

    return <div>로그인 처리 중...</div>;
};

export default AuthCallback;
