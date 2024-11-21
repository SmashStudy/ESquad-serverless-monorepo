import React, { useState } from 'react';
import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import ChatWindow from './ChatWindow.jsx';
// import {createTeamChatRoom} from "./chatApi/ChatApi.jsx";

export default function ChatDrawer({ teams, isOpen, toggleDrawer }) {
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
                        width: '430px',
                        height: '100%',
                        overflow: 'hidden',
                    }}
                >
                    <ChatWindow teams={teams} />
                </Box>
            </SwipeableDrawer>
        </div>
    );
}

