import React, { useState } from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import ChatMessages from './ChatMessages.jsx';

const ChatWindow = ({ teams }) => {
    const theme = useTheme();

    const [currentChatRoom, setCurrentChatRoom] = useState(teams[0] || null);
    const [messageInput, setMessageInput] = useState('');
    const [editingMessage, setEditingMessage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [teamList, setTeamList] = useState(teams || []);

    const handleCreateTeamChatRoom = async (teamName) => {
        try {
            const newTeam = {
                teamID: `team_${Date.now()}`,
                teamName: teamName,
            };

            // const response = await createTeamChatRoom(newTeam.teamID, newTeam.teamName);
            // console.log("팀 채팅방 생성 성공:", response);

            setTeamList((prevList) => [...prevList, newTeam]);
            setCurrentChatRoom(newTeam);
        } catch (error) {
            console.error("채팅방 생성 실패:", error.message);
        }
    };

    const handleChatRoomSelect = (room) => {
        setCurrentChatRoom(room);
    };

    const sendMessage = (message) => {
        if (message.trim() === '' && !selectedFile) {
            alert("메시지 또는 파일을 입력해주세요.");
            return;
        }
        setMessageInput('');
        setSelectedFile(null);
    };

    const onSaveMessage = () => {
        if (editingMessage) {
            console.log(`Saving edited message: ${editingMessage.timestamp}`);
            setEditingMessage(null);
            setMessageInput('');
        }
    };

    const handleEditMessage = (message) => {
        setEditingMessage(message);
        setMessageInput(message.message);
    };

    const handleUploadClick = () => {
        console.log("파일 업로드 클릭");
    };

    const handleRemoveFile = () => {
        setSelectedFile(null);
        console.log("파일 제거");
    };

    const deleteMessage = (message) => {
        console.log(`Deleting message: ${message.timestamp}`);
    };

    return (
        <Box
            sx={{
                border: '1px solid #ddd',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                height: '97vh',
                backgroundColor: '#f7f7f7',
            }}
        >
            {teams.length === 0 ? (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h6" color={theme.palette.text.secondary}>
                        현재 가입된 팀이 없습니다. 팀에 가입해주세요!
                    </Typography>
                </Box>
            ) : (
                <>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 2,
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            width: '100%',
                            height: '60px', // 고정된 높이 설정
                            overflowX: 'auto', // 가로 스크롤만 허용
                            overflowY: 'hidden', // 세로 스크롤 숨김
                            whiteSpace: 'nowrap', // 가로로 요소가 나열되도록 설정
                            padding: '12px',
                            borderBottom: '2px solid #ddd',
                            marginBottom: '12px',
                        }}
                    >
                        {teams.map((team, index) => (
                            <Button
                                key={index}
                                onClick={() => handleChatRoomSelect(team)}
                                sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    padding: '0.5rem 1rem',
                                    backgroundColor: currentChatRoom?.id === team.id ? '#d7bce8' : '#fff',
                                    color: currentChatRoom?.id === team.id ? '#6a1b9a' : '#424242',
                                    borderRadius: '12px',
                                }}
                            >
                                {team.teamName}
                            </Button>
                        ))}
                    </Box>

                    <Box
                        sx={{
                            flexGrow: 1,
                            overflowY: 'auto',
                            padding: '1rem',
                            backgroundColor: '#ffffff',
                            borderRadius: 3,
                        }}
                    >
                        <ChatMessages
                            currentChatRoom={currentChatRoom}
                            onEditMessage={handleEditMessage}
                            onDeleteMessage={deleteMessage}
                            sendMessage={sendMessage}
                            onSaveMessage={onSaveMessage}
                        />
                    </Box>

                    <Box
                        sx={{
                            position: 'sticky',
                            bottom: 0,
                            width: '100%',
                            padding: '0',
                            backgroundColor: '#f3f4f6',
                        }}
                    >
                    </Box>
                </>
            )}
        </Box>
    );
};

export default ChatWindow;
