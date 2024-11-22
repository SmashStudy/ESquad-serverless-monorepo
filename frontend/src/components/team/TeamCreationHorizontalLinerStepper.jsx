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
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const steps = ['스페이스명', '팀원 초대', '확인', '이동'];

const TeamCreationHorizontalLinerStepper = ({ onCancel, updateTeams }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [teamName, setTeamName] = useState('');
    const [teamCrew, setTeamCrew] = useState([]);
    const [newCrew, setNewCrew] = useState('');
    const [searchError, setSearchError] = useState('');
    const [teamNameError, setTeamNameError] = useState('');
    const [loading, setLoading] = useState(false);
    const [teamId, setTeamId] = useState('');
    

    const navigate = useNavigate();
    const userInfo = { id: 'USER#123', username: 'esquadback'};

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
                setSearchError('팀 구성원은 최소 4명, 최대 12명이어야 합니다.');
                return;
            }
        }
        if (activeStep === 2) {
            await handleCreateTeam();
            setActiveStep((prevActiveStep) => prevActiveStep + 1);
        } 
        else { setActiveStep((prevActiveStep) => prevActiveStep + 1); }
    };

    const validateTeamName = async () => {

        if (!teamName.trim()) {
            setTeamNameError('팀 이름을 입력해주세요.');
            return false;
        }
        
        try {
            console.log(`Validating team name: ${teamName}`);
            const encodedTeamName = encodeURIComponent(teamName);
            setLoading(true);
            setTeamNameError('');
            
            const response = await axios.get(`https://api.esquad.click/teams/check-name/${encodedTeamName}`);
            const { isAvailable, message } = response.data;

            if (!isAvailable) {
                console.log(message);
                setTeamNameError('팀 이름이 이미 존재합니다. 다시 시도해주세요.');
                setTeamName(''); 
                return false;
            }

            console.log(message);
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
        { id: 'USER#001', username: 'Alice' },
        { id: 'USER#002', username: 'Bob' },
        { id: 'USER#003', username: 'Charlie' },
        { id: 'USER#004', username: 'David' },
        { id: 'USER#005', username: 'Eve' },
        { id: 'USER#006', username: 'Frank' },
        { id: 'USER#007', username: 'Grace' },
        { id: 'USER#008', username: 'Hank' },
        { id: 'USER#009', username: 'Ivy' },
        { id: 'USER#010', username: 'Jack' },
        { id: 'USER#011', username: 'Karen' },
        { id: 'USER#012', username: 'Leo' },
        { id: 'USER#013', username: 'Mona' },
        { id: 'USER#014', username: 'Nina' },
        { id: 'USER#015', username: 'Oscar' }
    ];
    const searchCrew = async () => {
        if (!validateNewCrew(newCrew)) return ;
        
        // 유저 닉네임으로 유무 판별
        // try {
        //     setLoading(true);
        //     const response = await axios.get(`https://api.esquad.click/dev/users?username=${newCrew}`);
            
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
            const response = await axios.post('https://api.esquad.click/teams',teamData);
            console.log('Team Created:', response.data.data);
            updateTeams(response.data.data);
            const createdTeamId = response.data.data.teamId;
            setTeamId(createdTeamId); // 상태 업데이트
            console.log(`Team ID: ${createdTeamId}`);
        } catch (error) {
            console.error('Error creating team:', error);
            setTeamNameError('팀 생성에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        onCancel();
    };
    const handleMove = () => {
        console.log(teamId);
        const encodedTeamId = encodeURIComponent(teamId);
        handleCancel();
        navigate(`/teams/${encodedTeamId}`);
    }

    // useEffect(() => {
    //     if (teamId) {
    //         fetchTeamData();
    //     }
    // }, [teamId]);
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
                    {steps.map((label) => (
                        <Step key={label} completed={false}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>
                {activeStep === steps.length - 1 ?(
                    <Box sx={{ textAlign: 'center', mt: 3 }}>
                        <Typography variant="h6"> {teamName} 팀이 생성되었습니다! </Typography>
                        <Box sx={{ mt: 3 }}>
                            <Button onClick={handleMove} variant="contained" color="primary">
                                    팀 페이지로 이동
                            </Button>
                            <Button onClick={handleCancel} sx={{ ml: 2 }}>
                                닫기
                            </Button>
                        </Box>
                    </Box>                                         
                ):(
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
                    
                        {/* 페이지 */}
                        <Box sx={{ display: 'flex', flexDirection: 'row', pt: 2 }}>
                            <Button
                                color="inherit"
                                disabled={activeStep === 0}
                                onClick={handleBack}
                                size="large"
                                sx={{ mr: 1 }}
                                startIcon={<NavigateBeforeIcon />}
                            > 이전 </Button>
                            <Box sx={{ flex: '1 1 auto' }} />
                            <Button
                                onClick={handleNext}
                                disabled={activeStep === 0 && !teamName.trim()}
                                size="large"
                                endIcon={activeStep === steps.length - 1 ? <CheckIcon /> : <NavigateNextIcon />}
                            > {activeStep === steps.length - 2 ? (loading ? '생성 중...' : '생성') : '다음'} </Button>
                        </Box>
                    </Stack>
                )}
            </Box>
        </Box>
    );
};

export default TeamCreationHorizontalLinerStepper;
