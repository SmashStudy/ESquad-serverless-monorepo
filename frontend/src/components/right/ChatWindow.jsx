import React, { useState, useEffect } from 'react';
import {alpha, Box, Button, Typography, useTheme} from '@mui/material';
import ChatMessages from './ChatMessages.jsx'; // ChatMessages 컴포넌트 임포트

const ChatWindow = ({ isSmallScreen, isMediumScreen, teams }) => {
    const theme = useTheme();
    const [currentChatRoom, setCurrentChatRoom] = useState(teams[0] || null); // 초기값을 null로 설정
    // 채팅방 선택 핸들러
    const handleChatRoomSelect = (room) => {
        setCurrentChatRoom(room);
    };

    return (
        <Box
            sx={{
                border: '1px solid black', // 범위 확인 용도
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
            {/* 팀이 없는 경우 메시지 표시할 영역 */}
            {teams.length === 0 ? (
                <Box sx={{
                    border: '1px solid blue', // 영역 확인 용도
                    flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h6" color={theme.palette.text.secondary}>
                        현재 가입된 팀이 없습니다. 팀에 가입해주세요!
                    </Typography>
                </Box>
            ) : (
                <>
                    {/* 상단에 존재하는 팀을 선택하는 영역 */}
                    {!isMediumScreen && (
                        <Box
                            sx={{
                                border: '1px solid green', // 영역 확인 용도
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
                                        backgroundColor: currentChatRoom?.id === team.id ? alpha(theme.palette.primary.main, 0.1) : '#fff',
                                        borderRadius: 1,
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                        },
                                        border: '1px solid',
                                        borderColor: currentChatRoom?.id === team.id ? '#D1C4E9' : theme.palette.primary.light,
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
                                border: '1px solid pink', // 범위 확인 용도
                                display: 'flex',
                                flexDirection: 'row',
                                gap: 1,
                                height: '100%',
                                overflowX: 'auto',
                                pb: 2,
                            }}
                        >
                            {/* 가로 모드 일때 팀을 선택할 수 있는 영역 */}
                            <Box
                                sx={{
                                    border: '1px solid red',
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

                            {/* 가로 모드 일때 메시지 보여주는 영역 */}
                            <Box
                                sx={{
                                    border: '1px solid yellow',// 범위 확인 용도
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

                    {/* 세로모드 메시지 리스트 화면 */}
                    {!isMediumScreen && (
                        // 여기 안에 ChatInput 들어있는데 분리해서 chatInput 이 항상 고정되도록 할 것.
                        <Box
                            sx={{
                                border: '1px solid purple',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 1,
                                mt: 2,
                                flexGrow: 1,
                                borderRadius: 3,
                                overflowY: 'auto',
                                position: 'relative'
                            }}
                        >
                            {/* Entered : 팀명 ( 선택한 팀 명시해주는 부분 ) */}
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
