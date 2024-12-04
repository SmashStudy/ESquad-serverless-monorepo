import React from 'react';
import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import ChatMessages from "./ChatMessages.jsx";

export default function ChatDrawer({ isOpen, toggleDrawer, selectedTeam }) {
    const handleDrawerClose = () => {
        if (toggleDrawer) { toggleDrawer(false); }
    };

    const handleDrawerOpen = () => {
        if (toggleDrawer) { toggleDrawer(true);}
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
                </Box>
            </SwipeableDrawer>
        </div>
    );
}

