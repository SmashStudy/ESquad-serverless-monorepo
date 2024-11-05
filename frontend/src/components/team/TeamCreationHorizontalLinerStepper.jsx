import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    useTheme,
    Box,
    Button,
    Typography,
    Stack,
    InputLabel,
    Input,
    Chip,
    TextField,
    Stepper,
    Step,
    StepLabel,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CheckIcon from '@mui/icons-material/Check';
import FaceIcon from '@mui/icons-material/Face';
import PersonSearchIcon from '@mui/icons-material/PersonSearch';
// import { useUser } from '../form/UserContext.jsx';
import {fetchTeam} from "../../hooks/fetchTeam.jsx";

const steps = ['스페이스명', '팀원 초대', '확인'];

function TeamNameInput({ teamName, handleInputChange, teamNameError }) {
    return (
        <Box sx={{ pt: 2, textAlign: 'center' }}>
            <Typography sx={{ mt: 4, mb: 1, fontSize: 'x-large', fontWeight: 'bolder' }}>
                스페이스명 커스터마이즈하기
            </Typography>
            <Typography sx={{ mt: 2, mb: 8, fontSize: 'large' }}>
                개성있고 독특한 스페이스명으로 만들어보세요!
            </Typography>
            <InputLabel htmlFor="input-team-name" sx={{ mb: 1, textAlign: 'left', fontSize: 'medium' }}>
                스페이스명
            </InputLabel>
            <Input
                id="input-team-name"
                placeholder="당신과 함께할 팀 명은 무엇인가요?"
                aria-describedby="component-helper-text"
                fullWidth
                required
                value={teamName}
                onChange={handleInputChange}
            />
            {teamNameError && (
                <Typography color="error" sx={{ my: 2 }}>
                    {teamNameError}
                </Typography>
            )}
        </Box>
    );
}

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
                    placeholder="아이디를 입력하세요"
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

function ConfirmationStep({ teamName, teamCrew }) {
    return (
        <Box sx={{ pt: 2 }}>
            <Typography sx={{ mt: 2, mb: 1, fontSize: 'x-large', fontWeight: 'bolder' }}>마지막으로 확인해주세요</Typography>
            <Typography sx={{ mt: 2, mb: 8, fontSize: 'large' }}>스페이스명과 크루원들이 맞는지 확인하세요.</Typography>

            <Stack spacing={{ xs: 1, sm: 2 }} sx={{ alignItems: 'center', justifyContent: 'space-evenly' }}>
                <Box sx={{ display: 'flex' }}>
                    <Typography sx={{ mx: 2, fontSize: 'large', fontWeight: 'bold' }}>스페이스명 :</Typography>
                    <Typography sx={{ fontSize: 'large', fontWeight: 'bold' }}>{teamName}</Typography>
                </Box>
                <Typography sx={{ mx: 2, fontSize: 'large', fontWeight: 'bold' }}>크루 :</Typography>
                <Box
                    sx={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        display: 'flex',
                        flexWrap: 'wrap',
                        maxWidth: '70%',
                        listStyle: 'none',
                        p: 0.5,
                        m: 0,
                    }}
                    component="ul"
                >
                    {teamCrew.map((crew, index) => (
                        <Chip
                            key={index}
                            sx={{ fontSize: 'small', mb: 1, mr: 1 }}
                            icon={<FaceIcon />}
                            label={crew.username}
                            variant="outlined"
                        />
                    ))}
                </Box>
            </Stack>
        </Box>
    );
}

const TeamCreationHorizontalLinerStepper = ({ onCancel, updateTeams }) => {
    const theme = useTheme();
    const [activeStep, setActiveStep] = useState(0);
    const [teamName, setTeamName] = useState('');
    const [teamCrew, setTeamCrew] = useState([]);
    const [newCrew, setNewCrew] = useState('');
    const [searchError, setSearchError] = useState('');
    const [teamNameError, setTeamNameError] = useState('');
    const [loading, setLoading] = useState(false);
    // const { userInfo } = useUser(); // 유저 정보
    const userInfo = { id: 28, username: 'esquadback'}      // 유저 더미 데이터

    const updateTeamCrew = () => {
        setTeamCrew([{ id: userInfo.id, username: userInfo.username, role: 'manager' }]);
    }

    useEffect(() => {
        // Add the current user as the first crew member when the component is mounted
        if (userInfo && teamCrew.length === 0) {
            // setTeamCrew([{ id: userInfo.id, username: userInfo.username, role: 'manager' }]);
            updateTeamCrew();
        }
    }, [userInfo]);

    const handleBack = () => setActiveStep((prev) => prev - 1);

    const handleNext = async () => {
        if (activeStep === 0) {
            const isValidTeamName = await validateTeamName();
            if (!isValidTeamName) return;
        }
        if (activeStep === 1 && (teamCrew.length < 4 || teamCrew.length > 12)) return;
        if (activeStep === steps.length - 1) {
            await handleCreateTeam();
        } else {
            setActiveStep((prev) => prev + 1);
        }
    };

    const validateTeamName = async () => {
        return true;
    };

    const searchCrew = async () => {
        addTeamCrew({id: 34, username: "tlinel542"});
    };

    const validateNewCrew = (newCrew) => {
        if (teamCrew.length > 12) {
            setSearchError('팀원은 12명을 초과할 수 없습니다');
            return false;
        }
        if (teamCrew.some((crew) => crew.username.toUpperCase() === newCrew.toUpperCase())) {
            setSearchError('이미 추가한 유저입니다');
            return false;
        }
        return true;
    };

    const addTeamCrew = (user) => {
        setTeamCrew([...teamCrew, user]);
        setNewCrew('');
        setSearchError('');
    };

    const removeTeamMember = (member) => {
        setTeamCrew(teamCrew.filter((tm) => tm.username !== member.username));
    };

    const getTeams = () => {
        fetchTeam()
            .then((response) => {
                console.log(response);
                updateTeams(response);
            }).catch((error) => {
            console.log(error);
        });
    }


    const handleCreateTeam = async () => {

    };


    const handleReset = () => {
        setActiveStep(0);
        setTeamName('');
        setTeamCrew([]);
        setNewCrew('');
        setTeamNameError('');
        setSearchError('');
        setLoading(false);
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                maxWidth: '70vw',
                height: '80vh',
                mx: 'auto',
                my: 'auto',
                py: 2,
            }}
        >
            {/* Action Buttons */}
            <Box sx={{ width: '100%' }}>
                <Stepper activeStep={activeStep}>
                    {steps.map((label, index) => (
                        <Step key={label} completed={false}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                {activeStep === steps.length ? (
                    <React.Fragment>
                        <Typography sx={{ mt: 2, mb: 1 }}>{teamName} 을 위한 공간이 제공되었습니다!</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                            <Box sx={{ flex: '1 1 auto' }} />
                            <Button onClick={handleReset}>닫기</Button>
                        </Box>
                    </React.Fragment>
                ) : (
                    <React.Fragment>
                        <Stack spacing={2} sx={{ alignItems: 'center', justifyItems: 'center', justifyContent: 'center' }}>
                            {activeStep === 0 && (
                                <TeamNameInput
                                    teamName={teamName}
                                    handleInputChange={(e) => setTeamName(e.target.value)}
                                    teamNameError={teamNameError}
                                />
                            )}
                            {activeStep === 1 && (
                                <CrewManagement
                                    teamCrew={teamCrew}
                                    newCrew={newCrew}
                                    handleNewCrewChange={(e) => setNewCrew(e.target.value)}
                                    searchCrew={searchCrew}
                                    searchError={searchError}
                                    removeTeamMember={removeTeamMember}
                                />
                            )}
                            {activeStep === 2 && <ConfirmationStep teamName={teamName} teamCrew={teamCrew} />}

                            <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                                <Button
                                    color="inherit"
                                    disabled={activeStep === 0}
                                    onClick={handleBack}
                                    size="large"
                                    sx={{ mr: 1 }}
                                    startIcon={<NavigateBeforeIcon />}
                                >
                                    이전
                                </Button>
                                <Box sx={{ flex: '1 1 auto' }} />
                                <Button
                                    onClick={handleNext}
                                    disabled={activeStep === 0 && !teamName.trim()}
                                    size="large"
                                    endIcon={activeStep === steps.length - 1 ? <CheckIcon /> : <NavigateNextIcon />}
                                >
                                    {activeStep === steps.length - 1 ? (loading ? '생성 중...' : '생성') : '다음'}
                                </Button>
                            </Box>
                        </Stack>
                    </React.Fragment>
                )}
            </Box>
        </Box>
    );
};

export default TeamCreationHorizontalLinerStepper;
