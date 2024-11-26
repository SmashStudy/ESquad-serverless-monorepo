import React, { useEffect, useState } from 'react';
import { Box, Button, Typography, Grid } from '@mui/material';
import { FcGoogle } from "react-icons/fc";
import { initializeCognitoConfig, getCognitoConfig } from './Config.js';
import logo from '/Users/jeongmin/Esquad/ESquad-serverless-monorepo/frontend/src/assets/esquad-logo-bk.png'; // 로고 이미지 경로

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
        <Grid container sx={{ height: '100vh' }}>
            {/* Left Section */}
            <Grid
                item
                xs={12}
                lg={6}
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'grey.100',
                    padding: 4,
                }}
            >
                {/* 중앙화된 로그인 박스 */}
                <Box
                    sx={{
                        width: '100%',
                        maxWidth: 500,
                        padding: 4,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'grey.300',
                        backgroundColor: 'white',
                        boxShadow: 3,
                        textAlign: 'center',
                        position: 'relative',
                    }}
                >
                    {/* 로고 */}
                    <Box sx={{ textAlign: 'center', marginBottom: 3 }}>
                        <img
                            src={logo}
                            alt="Esquad Logo"
                            style={{ width: '100px', height: 'auto' }}
                        />
                    </Box>

                    {/* 제목 */}
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        Welcome to Esquad
                    </Typography>

                    {/* 구글 로그인 버튼 */}
                    <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Button
                            type="button"
                            variant="outlined"
                            startIcon={<FcGoogle />}
                            sx={{
                                py: 1.5,
                                borderColor: 'grey.400',
                                '&:hover': { backgroundColor: 'grey.100' },
                            }}
                            onClick={handleGoogleLogin} // 구글 소셜 로그인 핸들러 연결
                        >
                            구글로 로그인
                        </Button>
                    </Box>
                </Box>
            </Grid>

            {/* Right Section */}
            <Grid
                item
                xs={12}
                lg={6}
                sx={{
                    display: { xs: 'none', lg: 'flex' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'grey.100',
                    position: 'relative',
                }}
            >
                <Box
                    sx={{
                        width: 240,
                        height: 240,
                        backgroundImage: 'linear-gradient(to top right, #7e57c2, #ec407a)',
                        borderRadius: '50%',
                        animation: 'bounce 2s infinite',
                    }}
                />
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        width: '100%',
                        height: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)',
                    }}
                />
            </Grid>
        </Grid>
    );
};

export default GoogleLogin;
