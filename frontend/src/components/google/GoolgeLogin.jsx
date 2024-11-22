// src/GoogleLogin.jsx
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";
import React, { useEffect, useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { initializeCognitoConfig, getCognitoConfig } from './Config.js';

const GoogleLogin = () => {
    const [loading, setLoading] = useState(true); // 로딩 상태
    const [config, setConfig] = useState(null); // 환경 변수 상태

    // 환경 변수 로드
    useEffect(() => {
        const loadConfig = async () => {
            try {
                await initializeCognitoConfig(); // Cognito 환경 변수 초기화
                const cognitoConfig = getCognitoConfig(); // 초기화된 환경 변수 가져오기
                setConfig(cognitoConfig); // 상태에 설정
            } catch (error) {
                console.error('환경 변수 로드 중 오류 발생:', error);
            } finally {
                setLoading(false); // 로딩 상태 종료
            }
        };

        loadConfig();
    }, []);

    // 구글 로그인 핸들러 함수
    const handleGoogleLogin = () => {
        if (!config) {
            console.error('Cognito Config가 초기화되지 않았습니다.');
            return;
        }

        const { clientId, redirectUri, domain, scope, responseType } = config;

        // AWS Cognito 구글 소셜 로그인 URL 생성
        const cognitoGoogleLoginUrl = `https://${domain}/oauth2/authorize?client_id=${clientId}&response_type=${responseType}&scope=${scope}&redirect_uri=${encodeURIComponent(redirectUri)}`;

        // 구글 로그인 페이지로 이동
        window.location.href = cognitoGoogleLoginUrl;
    };

    return (
        <Box sx={{ backgroundColor: 'white', p: 5, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
            <Typography variant='h4' fontWeight='bold'>다시 만나서 반가워요</Typography>
            <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Button
                    type="button"
                    variant='outlined'
                    startIcon={<FcGoogle />}
                    sx={{ py: 1.5 }}
                    onClick={handleGoogleLogin} // 구글 소셜 로그인 핸들러 연결
                >
                    구글로 로그인
                </Button>
            </Box>
        </Box>
    );
};

export default GoogleLogin;
