import React from 'react';
import { Box, Typography, Stack, TextField, Button } from '@mui/material';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';

function TeamUserManagement({ teamUsers = [], newTeamUser, handlenewTeamUserChange, searchUser, searchError, removeTeamUser }) {
    const isTeamFull = teamUsers.length >= 12;

    return (
        <Box sx={{ pt: 2 }}>
            <Typography sx={{ mt: 4, mb: 1, fontSize: 'x-large', fontWeight: 'bolder' }}>
                크루 초대하기
            </Typography>
            <Typography sx={{ mt: 2, mb: 5, fontSize: 'large' }}>
                동행할 크루를 초대하여 함께 성장해요!
            </Typography>
            <Typography sx={{ mb: 2, fontSize: 'small', color: 'red' }}>
                ( 크루는 본인을 포함하여 12명 이하로 꾸려주세요 )
            </Typography>

            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <TextField
                    id="input-new-User"
                    value={newTeamUser}
                    placeholder="구글 이메일 주소를 입력하세요"
                    onChange={handlenewTeamUserChange}
                    disabled={isTeamFull}
                    fullWidth
                />
                <Button
                    variant="text"
                    onClick={searchUser}
                    size="large"
                    endIcon={<PersonSearchIcon />}
                    disabled={isTeamFull}
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
                        gap: 2,
                    }}
                >
                    {teamUsers.map((user) => (
                        <Box
                            key={user} // 고유값 사용
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: 'calc(50% - 8px)', // 반응형 레이아웃
                                maxWidth: '500px',
                                px: 2,
                                py: 1,
                                border: '1px solid lightgrey',
                                borderRadius: '8px',
                                backgroundColor: '#fafafa',
                            }}
                        >
                            <Typography sx={{ width: '80%', textAlign: 'left' }}>
                                {user|| '알 수 없는 사용자'}
                            </Typography>
                            <Button
                                color="error"
                                onClick={() => removeTeamUser(user)}
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
