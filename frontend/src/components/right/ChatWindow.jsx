import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import ChatMessages from './ChatMessages.jsx'; // ChatMessages 컴포넌트 임포트

const ChatWindow = ({ isSmallScreen, isMediumScreen, teams }) => {
    const theme = useTheme();
    const [currentChatRoom, setCurrentChatRoom] = useState(teams[0] || null); // 초기값을 null로 설정

    // Chat Room Selection Handler
    const handleChatRoomSelect = (room) => {
        setCurrentChatRoom(room);
    };

    return (
        <Box
            sx={{
                flex: isMediumScreen ? 4 : 3,
                gap: 1,
                p: 2,
                height: isMediumScreen ? '40%' : '100%',
                overflowX: 'auto',
                display: 'flex',
                transition: 'width 0.3s ease',
                flexDirection: 'column',
            }}
        >
            {/* 팀이 없는 경우 메시지 표시 */}
            {teams.length === 0 ? (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h6" color={theme.palette.text.secondary}>
                        현재 가입된 팀이 없습니다. 팀에 가입해주세요!
                    </Typography>
                </Box>
            ) : (
                <>
                    {/* Chat Rooms - Top Row for Larger Viewports */}
                    {!isMediumScreen && (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: 1,
                                overflowX: 'auto',
                                borderBottom: `1px solid ${theme.palette.divider}`,
                                pb: 1,
                            }}
                        >
                            {teams.map((team, index) => (
                                <Button
                                    key={index}
                                    onClick={() => handleChatRoomSelect(team)}
                                    className="chat-room-button"
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        p: 1,
                                        backgroundColor: currentChatRoom?.id === team.id ? theme.palette.primary.main : '#fff',
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: currentChatRoom?.id === team.id ? '#D1C4E9' : theme.palette.primary.main,
                                        minWidth: isSmallScreen ? '80px' : '120px',
                                        fontSize: isSmallScreen ? '0.75rem' : '1rem',
                                        mb: 1,
                                    }}
                                >
                                    {team.teamName}
                                </Button>
                            ))}
                        </Box>
                    )}

                    {/* Chat Rooms and Chat Messages - Split Columns for Smaller Viewports */}
                    {isMediumScreen && (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                gap: 1,
                                height: '100%',
                                overflowX: 'auto',
                                pb: 2,
                            }}
                        >
                            {/* Chat Rooms - Left Column */}
                            <Box
                                sx={{
                                    flex: 2,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 1,
                                    overflowY: 'auto',
                                    borderRight: `1px solid ${theme.palette.divider}`,
                                    pr: 2,
                                }}
                            >
                                {teams.map((team, index) => (
                                    <Button
                                        key={index}
                                        onClick={() => handleChatRoomSelect(team)}
                                        className="chat-room-button"
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            p: 1,
                                            backgroundColor: currentChatRoom?.id === team.id ? theme.palette.primary.main : '#fff',
                                            borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: currentChatRoom?.id === team.id ? '#D1C4E9' : theme.palette.primary.main,
                                            minWidth: isSmallScreen ? '80px' : '120px',
                                            fontSize: isSmallScreen ? '0.75rem' : '1rem',
                                            mb: 1,
                                        }}
                                    >
                                        {team.teamName}
                                    </Button>
                                ))}
                            </Box>

                            {/* Chat Messages - Right Column */}
                            <Box
                                sx={{
                                    flex: 8,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'width 0.3s ease',
                                    overflowY: 'hidden',
                                }}
                            >
                                {currentChatRoom && <ChatMessages currentChatRoom={currentChatRoom} />} {/* ChatMessages 컴포넌트 호출 */}
                            </Box>
                        </Box>
                    )}

                    {/* Chat Messages - Home Column for Larger Viewports */}
                    {!isMediumScreen && (
                        <Box
                            sx={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                mt: 2,
                                flexGrow: 1,
                                borderRadius: 3,
                                overflowY: 'auto',
                            }}
                        >
                            <Typography variant="body1" sx={{ color: theme.palette.primary.main, mb: 2 }}>Entered: {currentChatRoom.teamName}</Typography>
                            <ChatMessages currentChatRoom={currentChatRoom} /> {/* ChatMessages 컴포넌트 호출 */}
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
};

export default ChatWindow;
