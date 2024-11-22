// src/AuthCallback.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';
import { initializeCognitoConfig, getCognitoConfig } from './Config.js';

const AuthCallback = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true); // 로딩 상태 관리

    useEffect(() => {
        const exchangeCodeForToken = async (code) => {
            try {
                // Cognito 환경 변수 가져오기
                const { clientId, redirectUri, domain } = getCognitoConfig();

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
                    

                    // 메인 페이지로 이동
                    navigate('/');
                }

            } catch (error) {
                console.error('토큰 교환 중 오류 발생:', error);
                navigate('/error'); // 오류 발생 시 에러 페이지로 이동
            } finally {
                setLoading(false); // 로딩 상태 종료
            }
        };

        const initializeAuthCallback = async () => {
            try {
                await initializeCognitoConfig(); // Cognito 환경 변수 초기화
                const code = new URLSearchParams(location.search).get('code'); // URL에서 인증 코드 추출
                if (code) {
                    await exchangeCodeForToken(code); // 인증 코드로 토큰 교환
                } else {
                    console.error('URL에서 인증 코드를 찾을 수 없습니다.');
                    navigate('/error'); // 인증 코드가 없을 경우 에러 페이지로 이동
                }
            } catch (error) {
                console.error('AuthCallback 초기화 중 오류 발생:', error);
                navigate('/error');
            }
        };

        initializeAuthCallback();
    }, [location, navigate]);

    return null; // 모든 처리가 끝나면 아무것도 렌더링하지 않음
};

export default AuthCallback;
