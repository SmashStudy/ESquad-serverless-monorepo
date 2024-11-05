import React, { useEffect, useState } from 'react';
import { useUser } from "/src/components/form/UserContext.jsx"
import { Link } from "react-router-dom";
import { Container, Typography, TextField, Button, Grid, Box } from '@mui/material';

const UserInquiry = () => {
    const { userInfo } = useUser();
    const [userData, setUserData] = useState({
        username: '',
        nickname: '',
        email: '',
        phoneNumber: '',
        birthDay: '',
        address: ''
    });

    useEffect(() => {
        if (userInfo) {
            setUserData({
                username: userInfo.username || '',
                nickname: userInfo.nickname || '',
                email: userInfo.email || '',
                phoneNumber: userInfo.phoneNumber || '',
                birthDay: userInfo.birthDay || '',
                address: userInfo.address || ''
            });
        }
    }, [userInfo]);

    return (
        <Container maxWidth="sm" sx={{ bgcolor: '#ffffff', p: 4, borderRadius: 2, boxShadow: 3 }}>
            <Typography variant="h4" align="center" gutterBottom sx={{ color: '#6a1b9a' }}>
                내 정보
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <TextField
                        label="아이디"
                        value={userData.username}
                        fullWidth
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        sx={{ bgcolor: '#ffffff', borderRadius: 1 }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="닉네임"
                        value={userData.nickname}
                        fullWidth
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        sx={{ bgcolor: '#ffffff', borderRadius: 1 }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="이메일"
                        value={userData.email}
                        fullWidth
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        sx={{ bgcolor: '#ffffff', borderRadius: 1 }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="연락처"
                        value={userData.phoneNumber}
                        fullWidth
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        sx={{ bgcolor: '#ffffff', borderRadius: 1 }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="생년월일"
                        type="date"
                        value={userData.birthDay}
                        fullWidth
                        InputProps={{ readOnly: true }}
                        InputLabelProps={{ shrink: true }}
                        variant="outlined"
                        sx={{ bgcolor: '#ffffff', borderRadius: 1 }}
                    />
                </Grid>
                <Grid item xs={12}>
                    <TextField
                        label="주소"
                        value={userData.address}
                        fullWidth
                        InputProps={{ readOnly: true }}
                        variant="outlined"
                        sx={{ bgcolor: '#ffffff', borderRadius: 1 }}
                    />
                </Grid>
            </Grid>
            <Box mt={4} display="flex" justifyContent="space-between">
                <Button
                    component={Link}
                    to="/user/update"
                    variant="contained"
                    sx={{ bgcolor: '#7b1fa2', color: '#ffffff', '&:hover': { bgcolor: '#6a1b9a' } }}
                >
                    회원정보 수정
                </Button>
                <Button
                    component={Link}
                    to="/user/profile"
                    variant="contained"
                    sx={{ bgcolor: '#2196f3', color: '#ffffff', '&:hover': { bgcolor: '#1976d2' } }}
                >
                    확인
                </Button>
            </Box>
        </Container>
    );
};

export default UserInquiry;
