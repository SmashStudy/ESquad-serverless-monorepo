import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TeamNameInput from './stepfunction/TeamNameInput.jsx';
import ConfirmationStep from './stepfunction/ConfirmationStep.jsx';
import CrewManagement from './stepfunction/CrewManagement.jsx';
import {
    useTheme,
    Box,
    Button,
    Typography,
    Stack,
    Stepper,
    Step,
    StepLabel,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CheckIcon from '@mui/icons-material/Check';

const steps = ['스페이스명', '팀원 초대', '확인'];

const TeamCreationHorizontalLinerStepper = ({ onCancel, updateTeams }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [teamName, setTeamName] = useState('');
    const [teamCrew, setTeamCrew] = useState([]);
    const [newCrew, setNewCrew] = useState('');
    const [searchError, setSearchError] = useState('');
    const [teamNameError, setTeamNameError] = useState('');
    const [teamCrewError, setTeamCrewError] = useState('');
    const [loading, setLoading] = useState(false);
    const userInfo = { id: '28', username: 'esquadback'}

    const updateTeamCrew = () => {
        setTeamCrew([{ id: userInfo.id, username: userInfo.username, role: 'manager' }]);
    }

    useEffect(() => {
        if (userInfo && teamCrew.length === 0) {
            updateTeamCrew();
        }
    }, [userInfo]);

    const handleBack = () => setActiveStep((prev) => prev - 1);

    const handleNext = async () => {

        if (activeStep === 0) {
            const isValidTeamName = await validateTeamName();
            if (!isValidTeamName) return;
        }

        if (activeStep === 1) {
            if (teamCrew.length < 4 || teamCrew.length > 12) {
                setTeamCrewError('팀 구성원은 최소 4명, 최대 12명이어야 합니다.');
                return;
            }
        }

        if (activeStep === steps.length - 1) { await handleCreateTeam(); } 
        else { setActiveStep((prevActiveStep) => prevActiveStep + 1); }
    };

    const validateTeamName = async () => {

        if (!teamName.trim()) {
            setTeamNameError('팀 이름을 입력해주세요.');
            return false;
        }
        
        try {
            console.log(teamName);
            const encodedTeamName = encodeURIComponent(teamName);
            console.log(encodedTeamName);

            setLoading(true);
            setTeamNameError('');
            const response = await axios.get(`https://api.esquad.click/dev/api/teams/new/${encodedTeamName}`);
            console.log('Team Name Validate:', response);
            setTeamNameError('');
            return true;  
        } catch (error) {
            console.error('Error validate team:', error);
            setTeamNameError('팀 이름이 이미 존재합니다. 다시 시도해주세요.');
            setTeamName('');
            return false;
        } finally {
            setLoading(false);
        }        
    };

    const localUserDatabase = [
        { id: 'user1', username: 'Alice' },
        { id: 'user2', username: 'Bob' },
        { id: 'user3', username: 'Charlie' },
        { id: 'user4', username: 'David' },
    ];
    
    const searchCrew = async () => {
        if (!validateNewCrew(newCrew)) return ;
        
        // 유저 닉네임으로 유무 판별
        // try {
        //     setLoading(true);
        //     const response = await axios.get(`https://api.esquad.click/dev/api/users?username=${newCrew}`);
            
        //     if (response.data && response.data.username) {
        //         addTeamCrew({ id: response.data.id, username: response.data.username });
        //     } else {
        //         setSearchError('존재하지 않는 사용자입니다.');
        //     }
        // } catch (error) {
        //     console.error('Error searching user:', error);
        //     setSearchError('유저 검색 중 오류가 발생했습니다.');
        // } finally {
        //     setLoading(false);
        // }      
    
        const foundUser = localUserDatabase.find((user) => user.username.toLowerCase() === newCrew.toLowerCase());
        
        if (!foundUser) {
            setSearchError('존재하지 않는 사용자입니다.');
            return;
        }

        addTeamCrew({ id: foundUser.id, username: foundUser.username });
    };

    const validateNewCrew = (newCrew) => {
        if (teamCrew.length > 12) {
            setSearchError('팀원은 12명을 초과할 수 없습니다');
            return false;
        }
        if (!newCrew.trim()) {
            setSearchError('유저 ID를 입력해주세요');
            return false;
        }
        setSearchError('');
        return true;
    };

    const addTeamCrew = (user) => {

        if (teamCrew.some((crew) => crew.id === user.id)) {
            setSearchError('이미 추가한 유저입니다.');
            return;
        }

        setTeamCrew((prevCrew) => {
            const existingUser = prevCrew[0];
            return [existingUser, ...prevCrew.slice(1), user];
        });

        setNewCrew('');
        setSearchError('');
    };

    const removeTeamMember = (member) => {
        setTeamCrew(teamCrew.filter((tm) => tm.username !== member.username));
    };

    const handleCreateTeam = async () => {
        const teamData = {
            teamName: teamName,
            description: '이 팀은 React와 Serverless 프로젝트를 위한 공간입니다.',
            userIds: teamCrew.map((crew) => crew.id)
        };
        console.log(teamData);
    
        try {
            setLoading(true);
            const response = await axios.post('https://api.esquad.click/dev/api/teams/new',teamData);
            console.log('Team Created:', response.data);
        } catch (error) {
            console.error('Error creating team:', error);
            setTeamNameError('팀 생성에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
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
