import React from 'react';
import Box from '@mui/material/Box';
import SwipeableDrawer from '@mui/material/SwipeableDrawer';
import ChatWindow from "./ChatWindow.jsx";

export default function ChatDrawer({ isOpen, toggleDrawer}) {
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
                    <ChatWindow />
                </Box>
            </SwipeableDrawer>
        </div>
    );
}

