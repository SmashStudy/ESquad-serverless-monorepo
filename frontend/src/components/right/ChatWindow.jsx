import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import ChatMessages from './ChatMessages.jsx';
import {fetchTeamListAPI} from "./chatApi/ChatApi.jsx";

const ChatWindow = () => {
    const theme = useTheme();

    const [teams, setTeams] = useState([]); // 서버에서 가져온 팀 데이터 저장
    const [currentChatRoom, setCurrentChatRoom] = useState(null); // 현재 선택된 채팅방
    const [isLoading, setIsLoading] = useState(true); // 로딩 상태
    const [error, setError] = useState(null); // 에러 상태

    // 팀 데이터 가져오는 함수
    const fetchTeams = async () => {
        try {
            setIsLoading(true);
            setError(null);

            const teamData = await fetchTeamListAPI(); // API 호출
            setTeams(teamData);
            setCurrentChatRoom(teamData[0] || null); // 첫 번째 팀을 기본값으로 설정
        } catch (error) {
            console.error("팀 목록 가져오기 실패:", error.message);
            setError("팀 데이터를 불러오는 중 오류가 발생했습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTeams();
    }, []);

    const handleChatRoomSelect = (room) => {
        if (currentChatRoom?.id === room.id) return;
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
            {isLoading ? (
                // 로딩 상태 표시
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h6" color={theme.palette.text.secondary}>
                        팀 데이터를 불러오는 중입니다...
                    </Typography>
                </Box>
            ) : error ? (
                // 에러 상태 표시
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h6" color={theme.palette.error.main}>
                        {error}
                    </Typography>
                </Box>
            ) : teams.length === 0 ? (
                // 팀 목록이 없는 경우
                <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography variant="h6" color={theme.palette.text.secondary}>
                        현재 가입된 팀이 없습니다. 팀에 가입해주세요!
                    </Typography>
                </Box>
            ) : (
                // 팀 목록 및 채팅창
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
                        {currentChatRoom ? (
                            <ChatMessages currentChatRoom={currentChatRoom} />
                        ) : (
                            <Typography variant="h6" color={theme.palette.text.secondary}>
                                채팅방을 선택해주세요.
                            </Typography>
                        )}
                    </Box>
                </>
            )}
        </Box>
    );
};

export default ChatWindow;