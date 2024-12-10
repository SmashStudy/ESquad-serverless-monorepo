import React from 'react';
import ActivityPatternHeatmap from './ActivityPatternHeatmap.jsx';
import MemberContributionDashboard from './MemberContributionDashboard.jsx';
import StudyPerformanceInsights from './StudyPerformanceInsights.jsx';
import StudyTeamChart from './studyAnalysis.jsx';
const Team= () => {
  const  teamId = 'TEAM#b2c5dfb5-7a03-4fcb-b8b7-c23be94d9f66';

  return (
    <div>
      <h1> 데이터 대시보드</h1>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width:'100%' }}>
        
        <ActivityPatternHeatmap teamId = {teamId} />
        <MemberContributionDashboard teamId = {teamId}/>
        <StudyPerformanceInsights teamId = {teamId}/>
        <StudyTeamChart teamId={teamId}/>
      </div>
    </div>
  );
};

export default Team;