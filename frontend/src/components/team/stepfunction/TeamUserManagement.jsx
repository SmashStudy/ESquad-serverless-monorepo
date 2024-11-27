import React from 'react';
import { Box, Typography, Stack, TextField, Button } from '@mui/material';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';

function TeamUserManagement({ teamUsers = [], newTeamUser, handlenewTeamUserChange, searchUser, searchError,removeTeamUser }) {
    const isTeamFull = teamUsers.length >= 12;

    return (
        <Box sx={{ pt: 2 }}>
            <Typography sx={{ mt: 4, mb: 1, fontSize: 'x-large', fontWeight: 'bold', color: '#3f51b5' }}>
                크루 초대하기
            </Typography>
            <Typography sx={{ mt: 2, mb: 5, fontSize: 'large', color: '#616161' }}>
                동행할 크루를 초대하여 함께 성장해요!
            </Typography>
            <Typography sx={{ mb: 2, fontSize: 'small', color: 'red' }}>
                ( 크루는 본인을 포함하여 12명 이하로 꾸려주세요 )
            </Typography>

            <Stack direction="row" spacing={2} sx={{ mb: 2,height:'55px' } }>
                <TextField
                    id="input-new-User"
                    value={newTeamUser}
                    placeholder="구글 이메일 주소를 입력하세요"
                    onChange={handlenewTeamUserChange}
                    disabled={isTeamFull}
                    fullWidth
                    sx={{
                        bgcolor: '#ffffff',
                        borderRadius: 1,
                        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.1)',
                    }}
                />
                <Button
                    variant="contained"
                    onClick={searchUser}
                    size="large"
                    endIcon={<PersonSearchIcon />}
                    disabled={isTeamFull}
                    sx={{
                        bgcolor: '#3f51b5',
                        color: '#fff',
                        '&:hover': {
                            bgcolor: '#303f9f',
                        },
                        boxShadow: '0px 2px 5px rgba(0, 0, 0, 0.2)',
                    }}
                >
                    초대
                </Button>
            </Stack>

            {searchError && (
                <Typography color="error" sx={{ my: 2 }}>
                    {searchError}
                </Typography>
            )}

            <Stack spacing={2}>
                <Box
                    sx={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        width: '700px',
                        
                        maxHeight: '18vh',
                        overflowY: 'auto', 
                    }}
                >
                    {teamUsers.map((user) => (
                        <Box
                            key={user}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: 'fit-content', 
                                maxWidth: '800px',
                                height: '5vh',
                                px: 3,
                                py: 2,
                                border: '1px solid #e0e0e0',
                                borderRadius: '8px',
                                backgroundColor: '#ffffff',
                                boxShadow: '0px 2px 10px rgba(0, 0, 0, 0.1)',
                                '&:hover': {
                                    boxShadow: '0px 4px 15px rgba(0, 0, 0, 0.2)',
                                    transform: 'translateY(-2px)',
                                    transition: '0.3s',
                                },
                            }}
                        >
                            <Typography sx={{ width: '100%', textAlign: 'left', fontWeight: 'bold', color: '#424242' }}>
                                {user || '알 수 없는 사용자'}
                            </Typography>
                            <Button
                                color="error"
                                onClick={() => removeTeamUser(user)}
                                sx={{
                                    fontWeight: 'bold',
                                    '&:hover': {
                                        bgcolor: '#ffcdd2',
                                    },
                                }}
                            >
                                삭제
                            </Button>
                        </Box>
                    ))}
                </Box>
            </Stack>
        </Box>
    );
}

export default TeamUserManagement;
