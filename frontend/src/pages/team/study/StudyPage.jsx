import React, { useState } from 'react';
import {
    Box,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material';
import { Link, Outlet } from 'react-router-dom';

const StudyPage = ({ isSmallScreen, isMediumScreen }) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                border: '1px solid',     // 추후 삭제
                mb: 2,
                height: '100%',
                width: '100%',
                overflowX: 'auto',
                overflowY: 'auto',
                position: 'relative',   // Added to make Fab relative to parent Box
            }}
        >
            <Outlet/>


        </Box>
    );
};

export default StudyPage;
