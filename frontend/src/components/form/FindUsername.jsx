import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Box, Button, CircularProgress, Container, TextField, Typography, Alert } from '@mui/material';

const FindUsername = () => {
    const [email, setEmail] = useState('');
    const [verificationNumber, setVerificationNumber] = useState('');
    const [maskedUsername, setMaskedUsername] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    useEffect(() => {
        setErrorMessage('');
    }, [step]);

    const handleSendEmail = async () => {

    };

    const handleVerifyNumber = async () => {

    };

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, p: 4, borderRadius: 2, boxShadow: 3, bgcolor: 'background.paper' }}>
                {step === 1 && (
                    <Box>
                        <Typography variant="h4" fontWeight="bold">아이디 찾기</Typography>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="이메일 주소"
                            variant="outlined"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2 }}
                            onClick={handleSendEmail}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : '인증번호 전송하기'}
                        </Button>
                    </Box>
                )}

                {step === 2 && (
                    <Box>
                        <Typography variant="h4" fontWeight="bold">아이디 찾기</Typography>
                        <TextField
                            fullWidth
                            margin="normal"
                            label="인증번호 입력"
                            variant="outlined"
                            value={verificationNumber}
                            onChange={(e) => setVerificationNumber(e.target.value)}
                            required
                        />
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 2 }}
                            onClick={handleVerifyNumber}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : '아이디 찾기'}
                        </Button>
                    </Box>
                )}

                {step === 3 && (
                    <Box>
                        <Typography variant="h4" fontWeight="bold">아이디 찾기</Typography>
                        <Typography variant="h6" sx={{ mt: 4 }}>
                            당신의 아이디: <strong>{maskedUsername}</strong>
                        </Typography>
                        <Button
                            fullWidth
                            variant="contained"
                            color="primary"
                            sx={{ mt: 4 }}
                            component={Link}
                            to="/login"
                        >
                            로그인하러 가기
                        </Button>
                    </Box>
                )}

                {errorMessage && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {errorMessage}
                    </Alert>
                )}
            </Box>
        </Container>
    );
};

export default FindUsername;
