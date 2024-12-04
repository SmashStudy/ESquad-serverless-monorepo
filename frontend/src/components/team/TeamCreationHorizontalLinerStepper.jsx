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
    StepLabel, useTheme,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import CheckIcon from '@mui/icons-material/Check';
import { useNavigate } from 'react-router-dom';
import {
  checkTeamNameAvailability,
  createTeam,
  getUserEmail,
} from '../../utils/team/TeamApi.jsx';
import {useTeams} from "../../context/TeamContext.jsx"; // teamApi 호출

const steps = ['팀 이름', '팀원 초대', '확인', '이동'];

const TeamCreationHorizontalLinerStepper = ({ onCancel, handleTab}) => {
    const theme = useTheme();
    const navigate = useNavigate();

    const [activeStep, setActiveStep] = useState(0);
    const [teamName, setTeamName] = useState('');
    const [teamUsers, setTeamUsers] = useState([]);
    const [newTeamUser, setnewTeamUser] = useState('');
    const [searchError, setSearchError] = useState('');
    const [teamNameError, setTeamNameError] = useState('');
    const [loading, setLoading] = useState(false);
    const [teamId, setTeamId] = useState('');
    const [error, setError] = useState('');
    const { updateTeams } = useTeams();

    useEffect(() => {
        let isMounted = true;
        const fetchEmail = async () => {
            try {
                setLoading(true);
                const email = await getUserEmail();
                if (isMounted) {
                    setTeamUsers([email]); // Trigger a state update
                }
            } catch (err) {
                if (isMounted) {
                    setError('이메일을 가져오는 중 오류가 발생했습니다.');
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        fetchEmail();
        return () => {
            isMounted = false; // Cleanup
        };
    }, []);

    const searchUser = async () => {
        if (!validatenewTeamUser(newTeamUser)) return ;

        try {
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

    const removeTeamUser= (removeUser) => {
      setTeamUsers(teamUsers.filter((teamUser) => teamUser !== removeUser));
    };

    const handleCreateTeam = async () => {
    const teamForm = {
      teamName: teamName,
      description: '',
      userIds: teamUsers,
    };

    try {
      setLoading(true);
      const newTeam = await createTeam(teamForm);
      updateTeams(newTeam);
      setTeamId(newTeam.PK);
      return true;
    } catch (error) {
      console.error('Error creating team:', error);
      setTeamNameError('팀 생성에 실패했습니다. 다시 시도해주세요.');
      return false;
    } finally {
      setLoading(false);
    }
    };

    const handleBack = () => setActiveStep((prev) => prev - 1);
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
    handleTab(1);

    onCancel();
    navigate(`/teams/${encodeURIComponent(teamId)}`);
    }

    // const handle
    const validateTeamName = async () => {

    if (!teamName.trim()) {
        setTeamNameError('팀 이름을 입력해주세요.');
        return false;
    }

    try {
        setLoading(true);
        setTeamNameError('');

        const { isAvailable, message } = await checkTeamNameAvailability(teamName);

        if (!isAvailable) {
          setTeamNameError(message);
          setTeamName('');
          return false;
        }
        return true;
    } catch (error) {
        console.error('Error validate team:', error);
        setTeamNameError('팀 이름이 잘못되었습니다.. 다시 시도해주세요.');
        setTeamName('');
        return false;
    } finally {
        setLoading(false);
    }
    };

    const validatenewTeamUser = (newTeamUser) => {
    if (!newTeamUser.trim()) {
        setSearchError('유저 ID를 입력해주세요');
        return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Gmail 형식 검증
    if (!emailRegex.test(newTeamUser)) {
      setSearchError(' 이메일 주소로 초대할 수 있습니다.');
      return false;
    }

    if (teamUsers.includes(newTeamUser)) {
      setSearchError('이미 초대된 유저입니다.');
      return false;
    }

    setSearchError('');
    return true;
    };

    return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        maxWidth: '70vw',
        maxHeight: '80vh',
        height: '80vh',
        mx: 'auto',
        my: 'auto',
        py: 2,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box sx={{ width: '100%',height: 'calc(100% - 20px)',}}>
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
              <Button onClick={()=>onCancel()} sx={{ ml: 2 }}>
                닫기
              </Button>
            </Box>
          </Box>
          ):(
            <Stack
              spacing={2}
              sx={{
                alignItems: 'center',
                justifyItems: 'center',
                justifyContent: 'center',
                maxWidth: '80vw',
                padding:0,
                height: 'calc(100% - 30px)', // 중앙 영역의 높이를 조절하여 Stepper와 페이징 버튼 사이의 균형 맞추기
                // overflowY: 'auto', // 중앙 UI 스크롤 가능
              }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'flex-start', // 위쪽 빈 공간 없애기
                  width: '90%',
                  height: '90%',
                  pd: 1, // 패딩을 줄여서 여백을 최소화
                  py: 2,
                  boxSizing: 'border-box',
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
                makerEmail={teamUsers[0]}
              />
            )}
            {activeStep === 2 && <ConfirmationStep teamName={teamName} teamUsers={teamUsers} />}
            </Box>

          </Stack>
        )}
                {/* 페이징 */}
                <Box sx={{
          width: '100%',
          position: 'absolute',
          marginTop:'0px',
          bottom: 0,
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',  // 중앙 정렬
          alignItems: 'center',
          paddingBottom:0,
          mt: 10,
          pd: 2
            }}>
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
      </Box>
    </Box>
    );
};

export default TeamCreationHorizontalLinerStepper;
