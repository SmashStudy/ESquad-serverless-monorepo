import React, { useState, useEffect } from 'react';
import { Box, Button, Typography, IconButton, Avatar, InputBase } from '@mui/material';
import { alpha, useTheme } from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';


const ChatArea = ({ isSmallScreen, isMediumScreen, teams, user }) => {

    const theme = useTheme();
    const [currentChatRoom, setCurrentChatRoom] = useState(teams[0]);

    // Chat Room Selection Handler
    const handleChatRoomSelect = (room) => {
        setCurrentChatRoom(room);
    };

    return (
        <Box
            sx={{
                // border: '1px solid',    // Chat area
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
                    {teams.length > 0 ? (
                        teams.map((team, index) => (
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
                                    borderColor: currentChatRoom?.id === team.id ? '#D1C4E9' : theme.palette.primary.main,
                                    minWidth: isSmallScreen ? '80px' : '120px', // Adjust button width based on screen size
                                    fontSize: isSmallScreen ? '0.75rem' : '1rem', // Adjust font size based on screen size
                                    mb: 1,
                                }}
                            >
                                {team.teamName}
                            </Button>
                        ))
                    ) : null}
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
                        {teams.length > 0 ? (
                            teams.map((team, index) => (
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
                                        borderColor: currentChatRoom?.id === team.id ? '#D1C4E9' : theme.palette.primary.main,
                                        minWidth: isSmallScreen ? '80px' : '120px', // Adjust button width based on screen size
                                        fontSize: isSmallScreen ? '0.75rem' : '1rem', // Adjust font size based on screen size
                                        mb: 1,
                                    }}
                                >
                                    {team.teamName}
                                </Button>
                            ))
                        ): null}
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
                        {/* Chat Messages */}
                        {/*<Typography variant="body1" sx={{ color: theme.palette.primary.main, mb: 1,}}>Entered: {currentChatRoom}</Typography>*/}
                        {currentChatRoom && (
                            <Box
                                sx={{
                                    border: '1px solid',
                                    flexGrow: 1,
                                    display: 'flex',
                                    flexDirection: 'column-reverse',
                                    backgroundColor: '#fff',
                                    p: 2,
                                    borderRadius: 3,
                                    overflowY: 'auto',
                                }}
                            >
                                {[...Array(6)].map((_, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            p: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 1,
                                        }}
                                    >
                                        <Avatar alt="User Avatar" src="/src/assets/user-avatar.png" />
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    fontWeight: 'bold',
                                                    mb: 1
                                                }}
                                            >
                                                유저 이름
                                            </Typography>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    border: `1px solid ${theme.palette.primary.main}`,
                                                    padding: '8px',
                                                    borderRadius: '10px',
                                                    backgroundColor: '#fff',
                                                    wordBreak: 'break-word'
                                                }}
                                            >
                                                Chat message example {index + 1}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{ color: 'gray' }}
                                            >
                                                몇 시 몇 분
                                            </Typography>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        )}

                        {/* Chat Input */}
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 1,
                                mt: 2,
                            }}
                        >
                            <IconButton>
                                <AttachFileIcon />
                            </IconButton>
                            <InputBase
                                placeholder="Type a message..."
                                sx={{
                                    flexGrow: 1,
                                    p: 1,
                                    border: '1px solid #ccc',
                                    borderRadius: 1,
                                    backgroundColor: '#fff',
                                }}
                            />
                            <Button
                                variant="contained"
                                sx={{
                                    height: '100%',
                                    borderRadius: '20px',
                                    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.secondary.main, 0.8),
                                    },
                                    px: 3,
                                }}
                            >
                                Send
                            </Button>
                        </Box>
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
                    {/* Chat Messages */}
                    <Typography variant="body1" sx={{ color: theme.palette.primary.main, mb: 2 }}>Entered: {currentChatRoom.teamName} </Typography>
                    {currentChatRoom && (
                        <Box
                            sx={{
                                flexGrow: 1,
                                display: 'flex',
                                flexDirection: 'column-reverse',
                                // gap: 1,    // 챗 간격
                                backgroundColor: '#fff',
                                p: 2,
                                borderRadius: 3,
                                overflowY: 'auto',
                            }}
                        >
                            {[...Array(6)].map((_, index) => (
                                <Box
                                    key={index}
                                    sx={{
                                        p: 1,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 1,
                                    }}
                                >
                                    <Avatar alt="User Avatar" src="/src/assets/user-avatar.png" />
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 'bold',
                                                mb: 1
                                            }}
                                        >
                                            유저 이름
                                        </Typography>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                border: `1px solid ${theme.palette.primary.main}`,
                                                padding: '8px',
                                                borderRadius: '10px',
                                                backgroundColor: '#fff',
                                                wordBreak: 'break-word'
                                            }}
                                        >
                                            Chat message example {index + 1}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{ color: 'gray' }}
                                        >
                                            몇 시 몇 분
                                        </Typography>
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    )}

                    {/* Chat Input */}
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1,
                            mt: 2,
                        }}
                    >
                        <IconButton>
                            <AttachFileIcon />
                        </IconButton>
                        <InputBase
                            placeholder="Type a message..."
                            sx={{
                                flexGrow: 1,
                                p: 1,
                                border: '1px solid #ccc',
                                borderRadius: 1,
                                backgroundColor: '#fff',
                            }}
                        />
                        <Button
                            variant="contained"
                            sx={{
                                height: '100%',
                                borderRadius: '20px',
                                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                                textTransform: 'none',
                                fontWeight: 'bold',
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.secondary.main, 0.8),
                                },
                                px: 3,
                            }}
                        >
                            Send
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default ChatArea;