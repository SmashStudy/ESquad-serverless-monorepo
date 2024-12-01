import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Divider,
  IconButton,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  Button,
  useTheme
} from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import Layout from './Layout';
import timeGridPlugin from '@fullcalendar/timegrid'; // 시간대 플러그인 추가


const UserProfile = () => {
  const [teamPage, setTeamPage] = useState(0); // 팀 페이지
  const [studyPage, setStudyPage] = useState(0); // 스터디 페이지
  const [selectedTeam, setSelectedTeam] = useState(null); // 선택된 팀
  const itemsPerPage = 3; // 팀 페이지당 항목 수
  const studiesPerPage = 5; // 스터디 페이지당 항목 수
  const theme = useTheme();

  const userTeams = [
    { id: 1, name: 'Frontend Developers', joinedAt: '2023-05-01', members: 25, description: 'HTML, CSS, React 등 프론트엔드 기술을 탐구하는 팀입니다.' },
    { id: 2, name: 'Backend Gurus', joinedAt: '2023-06-15', members: 18, description: 'Node.js, Python, Java 등을 사용하는 백엔드 개발 팀입니다.' },
    { id: 3, name: 'AI Innovators', joinedAt: '2023-07-20', members: 12, description: '머신러닝과 인공지능 프로젝트를 연구하는 팀입니다.' },
    { id: 4, name: 'Full Stack Enthusiasts', joinedAt: '2023-08-01', members: 22, description: '프론트엔드와 백엔드를 함께 공부하는 팀입니다.' },
    { id: 5, name: 'Mobile App Developers', joinedAt: '2023-09-10', members: 15, description: 'React Native와 Flutter를 사용하는 모바일 개발 팀입니다.' },
    { id: 6, name: 'Data Scientists', joinedAt: '2023-10-05', members: 30, description: '데이터 분석과 머신러닝을 공부하는 팀입니다.' },
    { id: 7, name: 'Cyber Security Experts', joinedAt: '2023-11-12', members: 10, description: '보안과 네트워크를 연구하는 팀입니다.' },
  ];
  
  const studyGroups = [
    { teamId: 1, title: 'React Mastery', description: 'React 심화 학습을 위한 스터디입니다.', members: 12, days: ['월', '수'], time: '10:00-12:00', startDate: '2024-11-01', endDate: '2024-12-30' },
    { teamId: 2, title: 'Advanced JavaScript', description: 'JavaScript의 고급 개념을 배우는 스터디입니다.', members: 8, days: ['화', '목'], time: '14:00-16:00', startDate: '2024-11-01', endDate: '2024-12-30' },
    { teamId: 3, title: 'UI/UX Design', description: '최신 UI/UX 디자인 트렌드를 연구하는 스터디입니다.', members: 15, days: ['화', '금'], time: '09:00-11:00', startDate: '2024-11-01', endDate: '2024-12-30' },
    { teamId: 2, title: 'Node.js Basics', description: 'Node.js 초급 과정을 다루는 스터디입니다.', members: 10, days: ['월', '토'], time: '13:00-15:00', startDate: '2024-11-01', endDate: '2024-12-30' },
    { teamId: 3, title: 'Python for Data Science', description: '데이터 사이언스를 위한 Python 활용 스터디입니다.', members: 20, days: ['수', '금'], time: '15:00-17:00', startDate: '2024-11-01', endDate: '2024-12-30' },
  ];
  
  

  const teamTotalPages = Math.ceil(userTeams.length / itemsPerPage);
  const filteredStudies = selectedTeam
    ? studyGroups.filter((study) => study.teamId === selectedTeam.id)
    : studyGroups;
  const studyTotalPages = Math.ceil(filteredStudies.length / studiesPerPage);

  const handleTeamNextPage = () => {
    if (teamPage < teamTotalPages - 1) setTeamPage(teamPage + 1);
  };

  const handleTeamPrevPage = () => {
    if (teamPage > 0) setTeamPage(teamPage - 1);
  };

  const handleStudyNextPage = () => {
    if (studyPage < studyTotalPages - 1) setStudyPage(studyPage + 1);
  };

  const handleStudyPrevPage = () => {
    if (studyPage > 0) setStudyPage(studyPage - 1);
  };

  const handleTeamSelect = (team) => {
    setSelectedTeam(team);
    setStudyPage(0); // 팀 선택 시 스터디 페이지 초기화
  };

  const handleClearTeam = () => {
    setSelectedTeam(null);
    setStudyPage(0); // 초기화 시 스터디 페이지 초기화
  };

  // 요일 문자열을 숫자로 변환 (0: 일요일 ~ 6: 토요일)
  const weekDayToNumber = { 일: 0, 월: 1, 화: 2, 수: 3, 목: 4, 금: 5, 토: 6 };

  const events = filteredStudies.flatMap((study) =>
    study.days.flatMap((day) => {
      const dayNumber = weekDayToNumber[day];
      const eventsForDay = [];
      let currentDate = new Date(study.startDate);
      const endDate = new Date(study.endDate);

      while (currentDate <= endDate) {
        if (currentDate.getDay() === dayNumber) {
          const [startTime, endTime] = study.time.split('-');
          eventsForDay.push({
            title: `${study.title} (${study.time})`,
            start: `${currentDate.toISOString().split('T')[0]}T${startTime}:00`,
            end: `${currentDate.toISOString().split('T')[0]}T${endTime}:00`,
          });
        }
        currentDate.setDate(currentDate.getDate() + 1);
      }
      return eventsForDay;
    })
  );

  return (
    <Layout>
      {/* 활동 중인 팀 섹션 */}
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        활동중인 팀
      </Typography>
      <Grid container spacing={2}>
        {userTeams
          .slice(teamPage * itemsPerPage, teamPage * itemsPerPage + itemsPerPage)
          .map((team) => (
            <Grid item xs={12} md={4} key={team.id}>
              <Card elevation={3} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {team.name}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 2 }}>
                    {team.description}
                  </Typography>
                  <Divider />
                  <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: 2 }}>
                    <Typography variant="body2">멤버: {team.members}명</Typography>
                    <Typography variant="body2">가입일: {team.joinedAt}</Typography>
                  </Box>
                  <Button
                    variant="contained"
                    size="small"
                    sx={{ marginTop: 2 }}
                    onClick={() => handleTeamSelect(team)}
                  >
                    선택
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>

      {/* 팀 페이지 네이션 */}
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
        <IconButton onClick={handleTeamPrevPage} disabled={teamPage === 0}>
          <ArrowBackIosIcon />
        </IconButton>
        <Typography sx={{ mx: 2 }}>{teamPage + 1} / {teamTotalPages}</Typography>
        <IconButton onClick={handleTeamNextPage} disabled={teamPage === teamTotalPages - 1}>
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>

      {/* 활동 캘린더 및 스터디 섹션 */}
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        활동 캘린더
      </Typography>
      <Box sx={{ display: 'flex', gap: 4, marginTop: 2, alignItems: 'stretch' }}>
      <Box
        sx={{
          flex: 2,
          padding: 2,
          backgroundColor: '#fff',
          borderRadius: 2,
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          '& .fc-toolbar-title': {color: '#333333', fontWeight: 'bold',},
          '& .fc-event': {
            backgroundColor: theme.palette.primary.main,
            color: '#fff',
          },
        }}
      >
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin]} // 시간대 표시 플러그인 추가
          initialView="timeGridWeek" // 주간 보기
          events={events}
          locale="ko" // 한국어 설정
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek',
          }}
          height="auto"
          slotMinTime="06:00:00" // 시작 시간
          slotMaxTime="22:00:00" // 종료 시간
        />
        </Box>
        {/* 스터디 리스트 */}
        <Paper sx={{ flex: 1, backgroundColor: '#fff', padding: 2 }}>
          <Typography variant="h6" sx={{ marginBottom: 2 }}>
            활동중인 스터디
          </Typography>
          <List>
            {filteredStudies.slice(studyPage * studiesPerPage, studyPage * studiesPerPage + studiesPerPage).map((study, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={study.title}
                  secondary={`활동 요일: ${study.days.join(', ')}`}
                />
              </ListItem>
            ))}
          </List>

          {/* 스터디 페이지 네이션 */}
          <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 2 }}>
            <IconButton onClick={handleStudyPrevPage} disabled={studyPage === 0}>
              <ArrowBackIosIcon />
            </IconButton>
            <Typography sx={{ mx: 2 }}>{studyPage + 1} / {studyTotalPages}</Typography>
            <IconButton onClick={handleStudyNextPage} disabled={studyPage === studyTotalPages - 1}>
              <ArrowForwardIosIcon />
            </IconButton>
          </Box>
        </Paper>
        </Box>
    </Layout>
  );
};

export default UserProfile;
