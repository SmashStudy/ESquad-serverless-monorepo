import React, { useState } from 'react';
import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import IconButton from '@mui/material/IconButton';
import EmailIcon from '@mui/icons-material/Email';
import ChatWindow from './ChatWindow.jsx';

export default function ChatDrawer({ isSmallScreen, isMediumScreen, teams, isOpen, toggleDrawer }) {
    return (
        <div>
            {/* SwipeableDrawer 설정 */}
            <SwipeableDrawer
                anchor="right"
                open={isOpen}
                onClose={toggleDrawer}
                onOpen={toggleDrawer}
            >
                <Box
                    sx={{
                        width: isSmallScreen ? '80vw' : '400px',
                        height: '100vh',
                        overflow: 'hidden',
                    }}
                >
                    <ChatWindow isSmallScreen={isSmallScreen} isMediumScreen={isMediumScreen} teams={teams} />
                </Box>
            </SwipeableDrawer>
        </div>
    );
}

