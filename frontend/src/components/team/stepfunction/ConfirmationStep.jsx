import React from 'react';
import { Box, Typography, Stack, Chip, useTheme } from '@mui/material';
import FaceIcon from '@mui/icons-material/Face';

function ConfirmationStep({ teamName, teamUsers }) {
    const theme = useTheme();

    return (
        <Box sx={{ pt: 2, textAlign: 'center' }}>
            <Typography
                sx={{
                    mt: 2,
                    mb: 1,
                    fontSize: 'x-large',
                    fontWeight: 'bolder',
                    textAlign:'center',
                    color: theme.palette.primary.main,
                }}
            >
                마지막으로 확인해주세요</Typography>
            <Typography
                sx={{
                    mt: 2,
                    mb: 8,
                    fontSize: 'large',
                    textAlign: 'center',
                    color: theme.palette.info.main,
                }}
            >
                스페이스명과 크루원들이 맞는지 확인하세요.</Typography>

            <Stack spacing={{ xs: 1, sm: 2 }} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    <Typography sx={{ mx: 2, fontSize: 'large', fontWeight: 'bold' }}>스페이스명 :</Typography>
                    <Typography sx={{ fontSize: 'large', fontWeight: 'bold', minWidth: '10vw' }}>{teamName}</Typography>
                </Box>
                <Typography sx={{ mx: 2, fontSize: 'large', fontWeight: 'bold'}}>크루 명단</Typography>
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
