import React, { useState } from 'react';
import { Box, Typography, Grid2, Paper, Tabs, Tab } from '@mui/material';
import ActivityPatternHeatmap from './ActivityPatternHeatmap.jsx';
import MemberContributionDashboard from './MemberContributionDashboard.jsx';
import StudyPerformanceInsights from './StudyPerformanceInsights.jsx';
import StudyTeamChart from './studyAnalysis.jsx';

const Team = ({ teamId, stat }) => {
  return (
    <>
      <Box sx={{ padding: 1, backgroundColor: '#f5f5f5', width: '100%', justifyContent: 'space-between', alignItems: 'center', height: '30px' }}>
        {/* 통계 토글 - 주별, 월별, 년별 */}

        <Box sx={{ display: 'flex' }}>
          {/* 활동 패턴 히트맵 */}
          <Grid2 item xs={12} sm={6} md={3} sx={{ padding: 1 }}>
            <Paper elevation={3} sx={{ padding: 3, backgroundColor: '#ffffff', width: '40vw' }}>
              <ActivityPatternHeatmap teamId={teamId} stat={stat} />
            </Paper>
          </Grid2>

          {/* 팀원 기여도 대시보드 */}
          <Grid2 item xs={12} sm={6} md={3} sx={{ padding: 1 }}>
            <Paper elevation={3} sx={{ padding: 3, backgroundColor: '#ffffff', width: '40vw' }}>
              <MemberContributionDashboard teamId={teamId} stat={stat} />
            </Paper>
          </Grid2>
        </Box>
        <Box sx={{ display: 'flex', height: '40vh' }}>
          {/* 학습 성과 인사이트 */}
          <Grid2 item xs={12} sm={6} md={3} sx={{ padding: 1 }}>
            <Paper elevation={3} sx={{ padding: 3, backgroundColor: '#ffffff', maxHeight: '43.5vh', width: '40vw' }}>
              <StudyPerformanceInsights teamId={teamId} stat={stat} />
            </Paper>
          </Grid2>

          {/* 팀 분석 차트 */}
          <Grid2 item xs={12} sm={6} md={3} sx={{ padding: 1 }}>
            <Paper elevation={3} sx={{ padding: 3, backgroundColor: '#ffffff', maxHeight: '43.5vh', width: '40vw' }}>
              <StudyTeamChart teamId={teamId} stat={stat} />
            </Paper>
          </Grid2>

        </Box>
      </Box>
    </>
  );
};

export default Team;
