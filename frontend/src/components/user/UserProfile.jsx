import React, {useEffect} from 'react';
import { Box, Avatar, Typography, Button } from '@mui/material';
import { Link, useNavigate } from "react-router-dom";


const UserProfile = () => {

    const navigate = useNavigate();


    const handleLogout = () => {
        localStorage.removeItem('jwt');
        alert("로그아웃 되었습니다. 다음에 또 만나요!")
        navigate('/logout');
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                p: 4,
                height: '100%',
                width: '100%',
            }}
        >


            <Box
                sx={{
                    border: '1px solid #d3d3d3',
                    borderRadius: 2,
                    width: '100%',
                    maxWidth: 600,
                    p: 4,
                    mb: 4,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Typography variant="h6" gutterBottom>
                    회원정보 조회
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    회원 정보를 확인하려면 아래 버튼을 클릭하세요.
                </Typography>
                <Link to="/user/inquiry" style={{ alignSelf: 'flex-end', width: '150px' }}>
                    <Button variant="outlined" color="primary" sx={{ width: '100%' }}>
                        정보 조회
                    </Button>
                </Link>
            </Box>

            <Box
                sx={{
                    border: '1px solid #d3d3d3',
                    borderRadius: 2,
                    width: '100%',
                    maxWidth: 600,
                    p: 4,
                    mb: 4,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Typography variant="h6" gutterBottom>
                    비밀번호
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    개인정보를 위해 비밀번호를 변경해 주세요.
                </Typography>
                <Link to="/user/password" style={{ alignSelf: 'flex-end', width: '150px' }}>
                    <Button variant="outlined" color="primary" sx={{ width: '100%' }}>
                        비밀번호 변경
                    </Button>
                </Link>
            </Box>

            <Box
                sx={{
                    border: '1px solid #d3d3d3',
                    borderRadius: 2,
                    width: '100%',
                    maxWidth: 600,
                    p: 4,
                    mb: 4,
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                <Typography variant="h6" gutterBottom>
                    로그아웃
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    로그아웃 하여 로그인 페이지로 이동 합니다.
                </Typography>
                <Button variant="outlined" color="error" onClick={handleLogout}  sx={{ alignSelf: 'flex-end', width: '150px' }}>
                    로그아웃
                </Button>
            </Box>
        </Box>
    );
};

export default UserProfile;
