import React from 'react';
import LoginForm from "../../components/form/LoginForm.jsx";
import { Box } from '@mui/material';

const LoginPage = ({ setIsLoggedIn }) => {
    return (
        <Box sx={{ display: 'flex', width: '100%', height: '100vh' }}>
            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LoginForm setIsLoggedIn={setIsLoggedIn} />
            </Box>
            <Box
                sx={{
                    flex: 1,
                    display: { lg: 'flex', xs: 'none' },
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative',
                    backgroundColor: 'grey.200'
                }}
            >
                <Box
                    sx={{
                        width: 240,
                        height: 240,
                        background: 'linear-gradient(to top right, #7C3AED, #EC4899)',
                        borderRadius: '50%',
                        animation: 'bounce 2s infinite'
                    }}
                />
                <Box
                    sx={{
                        width: '100%',
                        height: '50%',
                        position: 'absolute',
                        bottom: 0,
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        backdropFilter: 'blur(10px)'
                    }}
                />
            </Box>
        </Box>
    );
};

export default LoginPage;
