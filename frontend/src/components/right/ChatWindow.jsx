import React, { useState } from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import ChatMessages from './ChatMessages.jsx';

const ChatWindow = ({ teams }) => {
    const theme = useTheme();
    const [currentChatRoom, setCurrentChatRoom] = useState(teams[0] || null);
    const [teamList, setTeamList] = useState(teams || []);

    // 팀 채팅방 생성
    const handleCreateTeamChatRoom = async (teamName) => {
        try {
            const newTeam = {
                teamID: `team_${Date.now()}`,
                teamName: teamName,
            };

            setTeamList((prevList) => [...prevList, newTeam]);
            setCurrentChatRoom(newTeam);
        } catch (error) {
            console.error("채팅방 생성 실패:", error.message);
        }
    };

    // 채팅방 선택
    const handleChatRoomSelect = (room) => {
        setCurrentChatRoom(room);
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
            {/* 팀 목록이 없는 경우 */}
            {teams.length === 0 ? (
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h6" color={theme.palette.text.secondary}>
                        현재 가입된 팀이 없습니다. 팀에 가입해주세요!
                    </Typography>
                </Box>
            ) : (
                <>
                    {/* 팀 목록 */}
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            gap: 2,
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            width: '100%',
                            height: '60px',
                            overflowX: 'auto',
                            whiteSpace: 'nowrap',
                            padding: '12px',
                            borderBottom: '2px solid #ddd',
                            marginBottom: '12px',
                        }}
                    >
                        {teamList.map((team, index) => (
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

                    {/* 채팅 메시지 */}
                    <Box
                        sx={{
                            flexGrow: 1,
                            overflowY: 'auto',
                            padding: '1rem',
                            backgroundColor: '#ffffff',
                            borderRadius: 3,
                        }}
                    >
                        <ChatMessages currentChatRoom={currentChatRoom} />
                    </Box>
                </>
            )}
        </Box>
    );
};

export default ChatWindow;
