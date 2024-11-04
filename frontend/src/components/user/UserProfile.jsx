import React, {useEffect, useState} from 'react';
import { Box, Avatar, Typography, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {useUser} from "../form/UserContext.jsx"

const UserProfile = () => {


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
                    alignItems: 'center',
                }}
            >
                <Avatar
                    alt="User Avatar"
                    src="/path/to/avatar.png" // 사용자 아바타 이미지 경로
                    sx={{ width: 100, height: 100, mb: 2 }}
                />
                <Typography variant="h6" gutterBottom>
                    이정민
                </Typography>
                <Typography variant="body1" color="text.secondary" gutterBottom>
                    jeongmin0046@gmail.com
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    010-6276-2251
                </Typography>
                <Button variant="contained" color="primary" sx={{ alignSelf: 'flex-end', width: '120px' }}>
                    수정
                </Button>
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
                <Button variant="outlined" color="primary" sx={{ alignSelf: 'flex-end', width: '150px' }}>
                    비밀번호 변경
                </Button>
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
                    계정 삭제
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                    계정 삭제 시 모든 정보가 삭제 됩니다.
                </Typography>
                <Button variant="outlined" color="error" sx={{ alignSelf: 'flex-end', width: '150px' }}>
                    삭제하기
                </Button>
            </Box>
        </Box>
    );
};

export default UserProfile;
