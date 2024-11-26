import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
  Divider,
  IconButton,
  Grid,
  Button,
} from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

import Layout from './Layout';

const UserProfile = () => {
  const [currentPage, setCurrentPage] = useState(0); // 현재 페이지
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 가라 데이터 - 활동 중인 스터디
  const studyGroups = [
    {
      title: 'React Mastery',
      description: 'React 심화 학습을 위한 스터디입니다.',
      members: 12,
      createdAt: '2023-11-01',
      days: ['월', '수', '금'],
    },
    {
      title: 'Advanced JavaScript',
      description: 'JavaScript의 고급 개념을 배우는 스터디입니다.',
      members: 8,
      createdAt: '2023-10-15',
      days: ['화', '목'],
    },
    {
      title: 'UI/UX Design',
      description: '최신 UI/UX 디자인 트렌드를 연구하는 스터디입니다.',
      members: 15,
      createdAt: '2023-09-10',
      days: ['월', '금'],
    },
    {
      title: 'Node.js Basics',
      description: 'Node.js 초급 과정을 다루는 스터디입니다.',
      members: 10,
      createdAt: '2023-08-05',
      days: ['토', '일'],
    },
    {
      title: 'Python for Data Science',
      description: '데이터 사이언스를 위한 Python 활용 스터디입니다.',
      members: 20,
      createdAt: '2023-07-20',
      days: ['수', '토'],
    },
    {
      title: 'React Mastery',
      description: 'React 심화 학습을 위한 스터디입니다.',
      members: 12,
      createdAt: '2023-11-01',
      days: ['월', '수', '금'],
    },
    {
      title: 'Advanced JavaScript',
      description: 'JavaScript의 고급 개념을 배우는 스터디입니다.',
      members: 8,
      createdAt: '2023-10-15',
      days: ['화', '목'],
    },
    {
      title: 'UI/UX Design',
      description: '최신 UI/UX 디자인 트렌드를 연구하는 스터디입니다.',
      members: 15,
      createdAt: '2023-09-10',
      days: ['월', '금'],
    },
    {
      title: 'Node.js Basics',
      description: 'Node.js 초급 과정을 다루는 스터디입니다.',
      members: 10,
      createdAt: '2023-08-05',
      days: ['토', '일'],
    },
    {
      title: 'Python for Data Science',
      description: '데이터 사이언스를 위한 Python 활용 스터디입니다.',
      members: 20,
      createdAt: '2023-07-20',
      days: ['수', '토'],
    },
    {
      title: 'React Mastery',
      description: 'React 심화 학습을 위한 스터디입니다.',
      members: 12,
      createdAt: '2023-11-01',
      days: ['월', '수', '금'],
    },
    {
      title: 'Advanced JavaScript',
      description: 'JavaScript의 고급 개념을 배우는 스터디입니다.',
      members: 8,
      createdAt: '2023-10-15',
      days: ['화', '목'],
    },
    {
      title: 'UI/UX Design',
      description: '최신 UI/UX 디자인 트렌드를 연구하는 스터디입니다.',
      members: 15,
      createdAt: '2023-09-10',
      days: ['월', '금'],
    },
    {
      title: 'Node.js Basics',
      description: 'Node.js 초급 과정을 다루는 스터디입니다.',
      members: 10,
      createdAt: '2023-08-05',
      days: ['토', '일'],
    },
    {
      title: 'Python for Data Science',
      description: '데이터 사이언스를 위한 Python 활용 스터디입니다.',
      members: 20,
      createdAt: '2023-07-20',
      days: ['수', '토'],
    },
  ];

  const itemsPerPage = 3; // 페이지당 표시할 카드 수
  const totalPages = Math.ceil(studyGroups.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) setCurrentPage(currentPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <Typography variant="h6" color="error">{error}</Typography>
        <Button variant="contained" color="primary" onClick={() => window.location.reload()}>
          다시 시도
        </Button>
      </Box>
    );
  }

  return (
    <Layout>
      <Typography variant="h6" sx={{ marginBottom: 2 }}>
        활동중인 스터디
      </Typography>

      {/* Study Group Cards */}
      <Grid container spacing={2}>
        {studyGroups
          .slice(currentPage * itemsPerPage, currentPage * itemsPerPage + itemsPerPage)
          .map((study, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card elevation={3} sx={{ borderRadius: 3 }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {study.title}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ marginBottom: 2 }}>
                    {study.description}
                  </Typography>
                  <Divider />
                  <Box sx={{ display: 'flex', flexDirection: 'column', marginTop: 2 }}>
                    <Typography variant="body2">멤버: {study.members}명</Typography>
                    <Typography variant="body2">시작일: {study.createdAt}</Typography>
                    <Typography variant="body2">활동 요일: {study.days.join(', ')}</Typography>
                  </Box>
                </CardContent>
                <CardActions>
                  <Button size="small" color="primary">
                    상세보기
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
      </Grid>

      {/* Pagination */}
      <Box sx={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
        <IconButton onClick={handlePrevPage} disabled={currentPage === 0}>
          <ArrowBackIosIcon />
        </IconButton>
        <Typography sx={{ mx: 2 }}>{currentPage + 1} / {totalPages}</Typography>
        <IconButton onClick={handleNextPage} disabled={currentPage === totalPages - 1}>
          <ArrowForwardIosIcon />
        </IconButton>
      </Box>
    </Layout>
  );
};

export default UserProfile;
