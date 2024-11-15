import React from 'react';
import { Box, Typography, Stack, TextField, Button } from '@mui/material';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';

function CrewManagement({ teamCrew, newCrew, handleNewCrewChange, searchCrew, searchError, removeTeamMember }) {
    return (
        <Box sx={{ pt: 2 }}>
            <Typography sx={{ mt: 4, mb: 1, fontSize: 'x-large', fontWeight: 'bolder' }}>크루 초대하기</Typography>
            <Typography sx={{ mt: 2, mb: 5, fontSize: 'large' }}>동행할 크루를 초대하여 함께 성장해요!</Typography>
            <Typography sx={{ mb: 2, fontSize: 'small', color: 'red' }}>( 크루는 본인을 제외하여 3명 이상, 11명 이하로 꾸려주세요 )</Typography>

            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <TextField
                    id="input-new-crew"
                    value={newCrew}
                    placeholder="닉네임을 입력하세요"
                    onChange={handleNewCrewChange}
                    disabled={teamCrew.length >= 12}
                    fullWidth
                />
                <Button
                    variant="text"
                    onClick={searchCrew}
                    size="large"
                    endIcon={<PersonSearchIcon />}
                    disabled={teamCrew.length >= 12}
                >
                    검색
                </Button>
            </Stack>

            {searchError && (
                <Typography color="error" sx={{ my: 2 }}>
                    {searchError}
                </Typography>
            )}

            <Stack spacing={{ xs: 1, sm: 2 }}>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {teamCrew.map((crew, index) => (
                        <Box
                            key={index}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                width: 'calc(50% - 8px)',
                                maxWidth: '500px',
                                px: 2,
                                border: '1px solid lightgrey',
                                borderRadius: '8px',
                            }}
                        >
                            <Typography sx={{ width: '80%', textAlign: 'left' }}>{crew.username}</Typography>
                            <Button color="error" onClick={() => removeTeamMember(crew)}>
                                삭제
                            </Button>
                        </Box>
                    ))}
                </Box>
            </Stack>
        </Box>
    );
}

export default CrewManagement;
