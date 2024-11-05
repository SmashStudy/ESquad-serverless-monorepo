import { FcGoogle } from "react-icons/fc";
import { Link, useNavigate } from "react-router-dom";
import React, { useState, useEffect } from 'react';
import { useUser } from "/src/components/form/UserContext.jsx";
import useAxios from "/src/hooks/useAxios.jsx";
import { Box, Button, Checkbox, FormControl, FormControlLabel, InputLabel, TextField, Typography } from '@mui/material';

const LoginForm = ({ setIsLoggedIn }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();
    const { refetch: fetchUserInfo } = useUser(); // fetchUserInfo 호출

    // useAxios 커스텀 훅을 사용하여 POST 요청 설정
    const { data, error, loading, refetch: loginRequest } = useAxios({
        url: 'http://localhost:8080/api/users/login',
        method: 'POST',
        body: { username, password }, // 요청 본문에 아이디와 비밀번호 전송
        skip: true, // 요청을 처음부터 바로 실행하지 않음 (명시적으로 요청할 때만 실행)
    });

    const handleSubmit = async (e) => {
        e.preventDefault();  // 기본 동작 방지
    };

    return (
        <Box sx={{ backgroundColor: 'white', p: 5, borderRadius: 3, border: '1px solid', borderColor: 'grey.200' }}>
            <Typography variant='h4' fontWeight='bold'>다시 만나서 반가워요</Typography>
            <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>
                <FormControl fullWidth margin='normal'>
                    <Typography variant="body1" sx={{ mb: 1 }}>아이디</Typography>
                    <TextField
                        id="username"
                        name="username"
                        variant="outlined"
                        placeholder='아이디를 입력하세요'
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </FormControl>
                <FormControl fullWidth margin='normal'>
                    <Typography variant="body1" sx={{ mb: 1 }}>비밀번호</Typography>
                    <TextField
                        id="password"
                        name="password"
                        type="password"
                        variant="outlined"
                        placeholder='비밀번호를 입력하세요'
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </FormControl>


                <FormControlLabel
                    control={<Checkbox id="remember" />}
                    label="30일 동안 기억하기"
                    sx={{ mt: 2 }}
                />
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                    <Link to="/find-username">
                        <Button color='primary' variant='text'>아이디를 잊어버렸나요?</Button>
                    </Link>

                    <Link to="/find-password">
                        <Button color='primary' variant='text'>패스워드를 잊어버렸나요?</Button>
                    </Link>
                </Box>
                <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Button
                        type="submit"
                        variant='contained'
                        color='primary'
                        size='large'
                        sx={{ py: 1.5 }}
                        disabled={loading}
                    >
                        {loading ? '로그인 중...' : '로그인'}
                    </Button>
                    <Button
                        type="button"
                        variant='outlined'
                        startIcon={<FcGoogle />}
                        sx={{ py: 1.5 }}
                    >
                        구글로 로그인
                    </Button>
                </Box>
            </form>
            <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant='body1' fontWeight='bold'>아직 계정을 안만들었다구요?</Typography>
                <Link to="/join">
                    <Button color='primary' variant='text' sx={{ fontWeight: 'bold', ml: 1 }}>가입하러 가기</Button>
                </Link>
            </Box>
        </Box>
    );
}

export default LoginForm;
