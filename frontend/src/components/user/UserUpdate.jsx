import React, { useState, useEffect } from 'react';
import { useUser } from "/src/components/form/UserContext.jsx";
import axios from 'axios';
import { Link, useNavigate } from "react-router-dom";
import {TextField, Button, Container, Typography, Grid, Box, Alert, CircularProgress, useTheme} from '@mui/material';

const UserUpdate = () => {
    const { theme } = useTheme();
    const { userInfo, refetch } = useUser();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nickname: '',
        email: '',
        phoneNumber: '',
        birthDay: '',
        address: ''
    });
    const [nicknameAvailable, setNicknameAvailable] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (userInfo) {
            setFormData({
                nickname: userInfo.nickname || '',
                email: userInfo.email || '',
                phoneNumber: userInfo.phoneNumber || '',
                birthDay: userInfo.birthDay || '',
                address: userInfo.address || ''
            });
        }
    }, [userInfo]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id]: value
        });
    };

    const handleNicknameCheck = async () => {

    };

    const handleSubmit = async (e) => {

    };

    if (loading) {
        return <CircularProgress />;
    }

    return (
        <Container maxWidth="sm">
            <Box sx={{ mt: 8, p: 4, borderRadius: 2, boxShadow: 3, backgroundColor: theme.palette.background.default }}>
                <Typography variant="h4" component="h1" gutterBottom align="center">
                    회원정보 수정
                </Typography>
                <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                id="username"
                                label="아이디"
                                value={userInfo?.username || ''}
                                variant="outlined"
                                fullWidth
                                InputProps={{ readOnly: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                id="nickname"
                                label="닉네임"
                                value={formData.nickname}
                                onChange={handleChange}
                                variant="outlined"
                                fullWidth
                            />
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleNicknameCheck}
                                sx={{ mt: 2, display: 'block', mx: 'auto' }}
                            >
                                닉네임 중복 체크
                            </Button>
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                id="email"
                                label="이메일"
                                value={formData.email}
                                onChange={handleChange}
                                variant="outlined"
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                id="phoneNumber"
                                label="연락처"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                variant="outlined"
                                fullWidth
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                id="birthDay"
                                label="생년월일"
                                type="date"
                                value={formData.birthDay}
                                onChange={handleChange}
                                variant="outlined"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                id="address"
                                label="주소"
                                value={formData.address}
                                onChange={handleChange}
                                variant="outlined"
                                fullWidth
                            />
                        </Grid>
                    </Grid>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                        <Button
                            variant="contained"
                            color="secondary"
                            component={Link}
                            to="/user/profile"
                        >
                            취소
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                        >
                            회원정보 수정
                        </Button>
                    </Box>
                </form>
            </Box>
        </Container>
    );
};

export default UserUpdate;
