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
    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: '100vh',
                    backgroundImage: "linear-gradient(to top right, #E2A9F3, #5858FA)",
                }}
            >
                <img
                    src="https://s3-esquad-public.s3.us-east-1.amazonaws.com/esquad-logo-nbk.png"
                    alt="Esquad Logo"
                    style={{ width: '120px', marginBottom: '20px' }}
                />
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    <div
                        style={{
                            width: '40px',
                            height: '40px',
                            border: '4px solid #ddd',
                            borderTop: '4px solid #6200ee',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite',
                        }}
                    />
                </div>
                <p style={{ marginTop: '20px', color: '#555', fontSize: '16px' }}>
                    인증 중입니다. 잠시만 기다려 주세요...
                </p>
                <style>
                    {`
                        @keyframes spin {
                            0% { transform: rotate(0deg); }
                            100% { transform: rotate(360deg); }
                        }
                    `}
                </style>
            </div>
        );
    }

    return null; // 모든 처리가 끝나면 아무것도 렌더링하지 않음
};

export default AuthCallback;
