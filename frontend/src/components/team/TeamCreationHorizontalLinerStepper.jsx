import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TeamNameInput from './stepfunction/TeamNameInput.jsx';
import ConfirmationStep from './stepfunction/ConfirmationStep.jsx';
import TeamUserManagement from './stepfunction/TeamUserManagement.jsx';
import {
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
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode'; 
const steps = ['스페이스명', '팀원 초대', '확인', '이동'];

const TeamCreationHorizontalLinerStepper = ({ onCancel, updateTeams,setSelectedTeam }) => {
    const navigate = useNavigate();    
    const token = localStorage.getItem('jwtToken');

    const [activeStep, setActiveStep] = useState(0);
    const [teamName, setTeamName] = useState('');
    const [teamUsers, setTeamUsers] = useState([`${jwtDecode(token).email}`,"qwer@gmail.com"]);
    const [newTeamUser, setnewTeamUser] = useState('');
    const [searchError, setSearchError] = useState('');
    const [teamNameError, setTeamNameError] = useState('');
    const [loading, setLoading] = useState(false);
    const [teamId, setTeamId] = useState('');

    useEffect(() => {
        console.log(teamUsers);
        if (token && teamUsers.length === 0) {
            try {
                setTeamUsers([decodedToken.email]);
            } catch (error) {
                console.error('JWT 디코드 오류:', error);
            }
        }
    }, [token]);

    const handleBack = () => setActiveStep((prev) => prev - 1);

    const validateTeamName = async () => {

        if (!teamName.trim()) {
            setTeamNameError('팀 이름을 입력해주세요.');
            return false;
        }
        
        try {
            console.log(`Validating team name: ${teamName}`);
            
            setLoading(true);
            setTeamNameError('');
            
            const response = await axios.get(`https://api.esquad.click/teams/check-name/${encodeURIComponent(teamName)}`);
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

    const searchUser = async () => {
        if (!validatenewTeamUser(newTeamUser)) return ;
        
        
        // 유저 닉네임으로 유무 판별
        try {
            const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/; // Gmail 형식 검증
            if (!emailRegex.test(newTeamUser)) {
                setSearchError('Gmail 형식의 이메일만 초대할 수 있습니다.');
                return;
            }

            if (teamUsers.includes(newTeamUser)) {
                setSearchError('이미 초대된 유저입니다.');
                return;
            }

            setTeamUsers((prevUsers) => [...prevUsers, newTeamUser]);
            setnewTeamUser('');
            setSearchError('');
            
        } catch (error) {
            console.error('Error searching user:', error);
            setSearchError('유저 초대 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const validatenewTeamUser = (newTeamUser) => {
        if (!newTeamUser.trim()) {
            setSearchError('유저 ID를 입력해주세요');
            return false;
        }
        setSearchError('');
        return true;
    };
    const removeTeamUser= (removeUser) => {
        
        setTeamUsers(teamUsers.filter((teamUser) => teamUser !== removeUser));
    };

    const handleCreateTeam = async () => {
        const teamForm = {
            teamName: teamName,
            description: '이 팀은 React와 Serverless 프로젝트를 위한 공간입니다.',
            userIds: teamUsers,
        };
        console.log(teamForm);
    
        try {
            setLoading(true);
            const response = await axios.post('https://api.esquad.click/teams/create', teamForm);
           
            updateTeams(response.data.data);
            setTeamId(response.data.data.teamId); // 상태 업데이트
           
            return true; // 성공 시 true 반환
        } catch (error) {
            console.error('Error creating team:', error);
            setTeamNameError('팀 생성에 실패했습니다. 다시 시도해주세요.');
            return false; // 실패 시 false 반환
        } finally {
            setLoading(false);
        }
    };
    
    const handleNext = async () => {
        if (activeStep === 0) {
            const isValidTeamName = await validateTeamName();
            if (!isValidTeamName) return;
        }
        if (activeStep === 1) {
            if (teamUsers.length > 12) {
                setSearchError('팀 구성원은 최대 12명입니다.');
                return;
            }
        }
        if (activeStep === 2) {
            const isTeamCreated = await handleCreateTeam();
            if (!isTeamCreated) return; // 팀 생성 실패 시 중단
        }
    
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };
    
    const handleMove = () => {
        if (!teamId) {
            console.error('팀 ID가 설정되지 않았습니다. 이동을 중단합니다.');
            alert('팀 ID가 설정되지 않았습니다. 팀을 다시 생성해 주세요.');
            return;
        }
    
        console.log(`??${teamId}`);
        const encodedTeamId = encodeURIComponent(teamId);
        handleCancel();
        navigate(`/teams/${encodedTeamId}`);
    }

    const handleCancel = () => {
        onCancel();
    };

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                maxWidth: '70vw',
                height: '50vh',
                mx: 'auto',
                my: 'auto',
                py: 2,
            }}
        >
            <Box sx={{ width: '100%' }}>
            {/* <Box> */}
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
                        <Stack spacing={2} sx={{ alignItems: 'center', justifyItems: 'center', justifyContent: 'center', maxWidth: '70vw', height: '43vh', }}>
                            <Box
                                sx={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'flex-start', // 위쪽 빈 공간 없애기
                                    width: '90%',
                                    height: '90%',
                                    p: 1, // 패딩을 줄여서 여백을 최소화
                                    boxSizing: 'border-box',
                                    bgcolor: '#ffffff',
                                }}
                            >
                        {activeStep === 0 && (
                            <TeamNameInput
                                teamName={teamName}
                                handleInputChange={(e) => setTeamName(e.target.value)}
                                teamNameError={teamNameError}
                            />
                        )}
                        {activeStep === 1 && (
                            <TeamUserManagement
                                teamUsers={teamUsers}
                                newTeamUser={newTeamUser}
                                handlenewTeamUserChange={(e) => setnewTeamUser(e.target.value)}
                                searchUser={searchUser}
                                searchError={searchError}
                                removeTeamUser={removeTeamUser}
                            />
                        )}
                        {activeStep === 2 && <ConfirmationStep teamName={teamName} teamUsers={teamUsers} />}
                        </Box>
                        {/* 페이지 */}
                        <Box sx={{ 
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            display: 'flex', 
                            flexDirection: 'row',  
                            justifyContent: 'center',  // 중앙 정렬
                            alignItems: 'center',  
                            mt: 'auto',
                            pb: 3 }}>
                            <Button
                                color="inherit"
                                disabled={activeStep === 0}
                                onClick={handleBack}
                                size="large"
                                sx={{ mr: 1 }}
                                startIcon={<NavigateBeforeIcon />}
                            > 이전 </Button>
                            
                            <Button
                                onClick={handleNext}
                                disabled={activeStep === 0 && !teamName.trim()}
                                size="large"
                                endIcon={activeStep === steps.length - 2? <CheckIcon /> : <NavigateNextIcon />}
                            > {activeStep === steps.length - 2 ? (loading ? '생성 중...' : '생성') : '다음'} </Button>
                        </Box>
                    </Stack>
                )}
            </Box>
        </Box>
    );
};

export default TeamCreationHorizontalLinerStepper;
