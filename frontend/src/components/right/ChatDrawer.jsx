import React, { useState } from 'react';
import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import ChatWindow from './ChatWindow.jsx';
import ChatMessages from "./ChatMessages.jsx";
// import {createTeamChatRoom} from "./chatApi/ChatApi.jsx";

export default function ChatDrawer({ isOpen, toggleDrawer, selectedTeam }) {
    const handleDrawerClose = () => {
        if (toggleDrawer) {
            toggleDrawer(false); // Drawer를 닫음
        }
    };

    const handleDrawerOpen = () => {
        if (toggleDrawer) {
            toggleDrawer(true); // Drawer를 염
        }
    };

    return (
        <div>
            {/* SwipeableDrawer 설정 */}
            <SwipeableDrawer
                anchor="right"
                open={isOpen}
                onClose={handleDrawerClose}
                onOpen={handleDrawerOpen}
            >
                <Box
                    sx={{
                        width: '430px',
                        height: '100%',
                        overflow: 'hidden',
                    }}
                >
                    {selectedTeam ? (
                        <ChatMessages currentChatRoom={{ id: selectedTeam.PK, teamName: selectedTeam.teamName }} />
                    ) : (
                        <div style={{ padding: '16px' }}>채팅방을 선택해주세요.</div>
                    )}

                    {/*<ChatWindow />*/}
                </Box>
            </SwipeableDrawer>
        </div>
    );
}

