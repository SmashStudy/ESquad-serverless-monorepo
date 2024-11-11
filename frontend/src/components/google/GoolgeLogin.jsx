// src/GoogleLogin.jsx
import { FcGoogle } from "react-icons/fc";
import { Link } from "react-router-dom";
import React, {userEffect} from 'react';
import { Box, Button, Typography } from '@mui/material';
import { COGNITO_CONFIG } from './Config.js';

const GoogleLogin = () => {

    // 구글 로그인 핸들러 함수
    const handleGoogleLogin = () => {
        const { clientId, redirectUri, domain, scope, responseType } = COGNITO_CONFIG;

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
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant='body1' fontWeight='bold'>아직 계정을 안만들었다구요?</Typography>
                <Link to="/join">
                    <Button color='primary' variant='text' sx={{ fontWeight: 'bold', ml: 1 }}>가입하러 가기</Button>
                </Link>
            </Box>
        </Box>
    );
};

export default GoogleLogin;
