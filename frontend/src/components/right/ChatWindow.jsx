import React, { useState, useEffect } from 'react';
import { alpha, Box, Button, Typography, useTheme } from '@mui/material';
import ChatMessages from './ChatMessages.jsx'; // ChatMessages 컴포넌트 임포트
import ChatInput from "./ChatInput.jsx";

const ChatWindow = ({ isSmallScreen, isMediumScreen, teams }) => {
    const theme = useTheme();

    // 상태 정의
    const [currentChatRoom, setCurrentChatRoom] = useState(teams[0] || null);
    const [messageInput, setMessageInput] = useState(''); // 메시지 입력 상태
    const [editingMessage, setEditingMessage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    // 채팅방 선택 핸들러
    const handleChatRoomSelect = (room) => {
        setCurrentChatRoom(room);
    };

    // 메시지 입력 핸들러
    const handleMessageInput = (event) => {
        setMessageInput(event.target.value);
    };

    // 메시지 전송 핸들러
    const sendMessage = (message) => {
        if (message.trim() === '') {
            alert("메시지를 입력해주세요.");
            return;
        }
        console.log(`Sending message: ${message} to chat room: ${currentChatRoom.teamName}`);
        setMessageInput(''); // 입력창 초기화
    };

    // 메시지 저장 핸들러 (수정 모드)
    const onSaveMessage = () => {
        console.log(`Editing message: ${editingMessage?.timestamp}`);
        setEditingMessage(null);
        setMessageInput('');
    };

    // 파일 업로드 핸들러
    const handleUploadClick = () => {
        console.log("파일 업로드 클릭");
    };

    // 파일 제거 핸들러
    const handleRemoveFile = () => {
        setSelectedFile(null);
        console.log("파일 제거");
    };

    return (
        <Box
            sx={{
                border: '1px solid black',
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
                <Box sx={{ border: '1px solid blue', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h6" color={theme.palette.text.secondary}>
                        현재 가입된 팀이 없습니다. 팀에 가입해주세요!
                    </Typography>
                </Box>
            ) : (
                <>
                    {/* 상단 팀 선택 영역 */}
                    {!isMediumScreen && (
                        <Box
                            sx={{
                                border: '1px solid green',
                                display: 'fixed',
                                flexDirection: 'row',
                                gap: 1,
                                overflowX: 'auto',
                                // borderBottom: `1px solid ${theme.palette.divider}`,
                                pb: 1,
                                width: '100%', // 너비 고정 (부모 요소 기준으로 설정)
                                height: '60px', // 높이 고정
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
                                        width: '100px', // 고정 너비 설정
                                        height: '40px', // 고정 높이 설정
                                        borderRadius: 1,
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

                    {/* 가로 모드 메시지 화면 */}
                    {isMediumScreen && (
                        <Box
                            sx={{
                                border: '1px solid pink',
                                display: 'flex',
                                flexDirection: 'row',
                                gap: 1,
                                height: '100%',
                                overflowX: 'auto',
                                pb: 2,
                            }}
                        >
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

                            <Box
                                sx={{
                                    border: '1px solid yellow',
                                    flex: 8,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'width 0.3s ease',
                                    overflowY: 'hidden',
                                }}
                            >
                                {currentChatRoom && <ChatMessages currentChatRoom={currentChatRoom} />}
                            </Box>
                        </Box>
                    )}

                    {/* 세로 모드 메시지 리스트 화면 */}
                    {!isMediumScreen && (
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
                                position: 'relative',
                                paddingBottom: 0,
                            }}
                        >

                            <Box
                                sx={{
                                    flex: 1,
                                    overflowY: 'auto',
                                    paddingBottom: '0px',
                                }}
                            >
                                <ChatMessages currentChatRoom={currentChatRoom} />
                            </Box>
                        </Box>
                    )}
                </>
            )}
        </Box>
    );
};

export default ChatWindow;
