import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import axios from 'axios';
import { TextField, Button, Typography, Box, Container, CircularProgress, Alert } from '@mui/material';

const FindPassword = () => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [verificationNumber, setVerificationNumber] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    useEffect(() => {
        setErrorMessage('');
    }, [step]);

    const handleSendEmail = async () => {

    };

    const handleVerifyNumberAndResetPassword = async () => {

    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, p: 4, border: '1px solid #ccc', borderRadius: 2, bgcolor: 'white' }}>
                {step === 1 && (
                    <Box>
                        <Typography variant="h4" gutterBottom>비밀번호 찾기</Typography>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="이메일 주소"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="아이디"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            onClick={handleSendEmail}
                            sx={{ mt: 2 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : '인증번호 전송하기'}
                        </Button>
                    </Box>
                )}

                {step === 2 && (
                    <Box>
                        <Typography variant="h4" gutterBottom>비밀번호 재설정</Typography>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="인증번호 입력"
                            type="text"
                            value={verificationNumber}
                            onChange={(e) => setVerificationNumber(e.target.value)}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="새 비밀번호"
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                        />
                        <TextField
                            fullWidth
                            margin="normal"
                            label="비밀번호 확인"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            onClick={handleVerifyNumberAndResetPassword}
                            sx={{ mt: 2 }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : '비밀번호 재설정하기'}
                        </Button>
                    </Box>
                )}

                {step === 3 && (
                    <Box>
                        <Typography variant="h4" gutterBottom>비밀번호 재설정 성공</Typography>
                        <Typography variant="body1" sx={{ mt: 2 }}>비밀번호가 성공적으로 재설정되었습니다.</Typography>
                        <Button
                            component={Link}
                            to="/login"
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2 }}
                        >
                            로그인하러 가기
                        </Button>
                    </Box>
                )}

                {errorMessage && (
                    <Alert severity="error" sx={{ mt: 2 }}>{errorMessage}</Alert>
                )}
            </Box>
        </Container>
    );
};

export default FindPassword;
