import React from 'react';
import { Box, Typography, Stack, Chip } from '@mui/material';
import FaceIcon from '@mui/icons-material/Face';

function ConfirmationStep({ teamName, teamUsers }) {
    return (
        <Box sx={{ pt: 2 }}>
            <Typography sx={{ mt: 2, mb: 1, fontSize: 'x-large', fontWeight: 'bolder' }}>마지막으로 확인해주세요</Typography>
            <Typography sx={{ mt: 2, mb: 8, fontSize: 'large' }}>스페이스명과 크루원들이 맞는지 확인하세요.</Typography>

            <Stack spacing={{ xs: 1, sm: 2 }} sx={{ alignItems: 'center', justifyContent: 'space-evenly' }}>
                <Box sx={{ display: 'flex' }}>
                    <Typography sx={{ mx: 2, fontSize: 'large', fontWeight: 'bold' }}>스페이스명 :</Typography>
                    <Typography sx={{ fontSize: 'large', fontWeight: 'bold' }}>{teamName}</Typography>
                </Box>
                <Typography sx={{ mx: 2, fontSize: 'large', fontWeight: 'bold' }}>크루 :</Typography>
                <Box
                    sx={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        display: 'flex',
                        flexWrap: 'wrap',
                        maxWidth: '70%',
                        listStyle: 'none',
                        p: 0.5,
                        m: 0,
                    }}
                    component="ul"
                >
                    {teamUsers.map((crew, index) => (
                        <Chip
                            key={index}
                            sx={{ fontSize: 'small', mb: 1, mr: 1 }}
                            icon={<FaceIcon />}
                            label={crew}
                            variant="outlined"
                        />
                    ))}
                </Box>
            </Stack>
        </Box>
    );
}

export default ConfirmationStep;
