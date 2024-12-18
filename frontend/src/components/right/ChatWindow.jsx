import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, useTheme } from '@mui/material';
import ChatMessages from './ChatMessages.jsx';
import {useTeams} from "../../context/TeamContext.jsx";

const ChatWindow = () => {
    const theme = useTheme();

    const {teams} = useTeams();
    const [currentChatRoom, setCurrentChatRoom] = useState(teams[0]); // 현재 선택된 채팅방
    const [isLoading, setIsLoading] = useState(false); // 로딩 상태
    const [error, setError] = useState(null); // 에러 상태

    // 팀 데이터 가져오는 함수
    useEffect(() => {
        if (teams && teams.length > 0) {
            setCurrentChatRoom(teams[0]); // 첫 번째 팀을 기본값으로 설정
        } else {
            setCurrentChatRoom(null);
        }
        setIsLoading(false);
    }, [teams]);

    const handleChatRoomSelect = (team) => {
        // 현재 선택된 채팅방과 새로 선택된 채팅방이 다를 경우에만 업데이트
        if (currentChatRoom?.id !== team.PK) {
            setCurrentChatRoom({ id: team.PK, teamName: team.teamName });
        }
    };


    return (
        <Box
            sx={{
                border: '1px solid #ddd',
                padding: '13px',
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
                                    backgroundColor: currentChatRoom?.id === team.PK ? '#d7bce8' : '#fff',
                                    color: currentChatRoom?.id === team.PK ? '#6a1b9a' : '#424242',
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
                            padding: '0rem',
                            backgroundColor: '#ffffff',
                            borderRadius: 3,
                        }}
                    >
                        {currentChatRoom ? (
                            <ChatMessages currentChatRoom={{ id: currentChatRoom.id, teamName: currentChatRoom.teamName }} />
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