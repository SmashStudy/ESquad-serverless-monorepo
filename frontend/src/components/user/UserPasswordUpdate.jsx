import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Container, TextField, Typography } from '@mui/material';

const PasswordUpdate = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
    });

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id]: value,
        });
    };

    const handleSubmit = async (e) => {

    };

    return (
        <Container maxWidth="sm" sx={{ backgroundColor: '#ffffff', padding: 4, borderRadius: 2, boxShadow: 3, mt: 8 }}>
            <Typography variant="h5" component="h2" align="center" gutterBottom>
                비밀번호 변경
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                    id="currentPassword"
                    label="현재 비밀번호"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    required
                />
                <TextField
                    id="newPassword"
                    label="새 비밀번호"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleChange}
                    variant="outlined"
                    fullWidth
                    required
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={() => navigate('/user/profile')}
                        fullWidth
                        sx={{ mr: 2 }}
                    >
                        취소
                    </Button>
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        fullWidth
                    >
                        비밀번호 변경
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default PasswordUpdate;
