import React from 'react';
import Team from './analystic/Team.jsx'
import LiveActivityMonitor from './analystic/LiveActivityMonitor.jsx';

const TeamDashboard = () => {
const  teamId = 'TEAM#b2c5dfb5-7a03-4fcb-b8b7-c23be94d9f66';
  return (
    <div>
      <div style={{  display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width:'100%' }}>
        <Team />
        <LiveActivityMonitor teamId = {teamId}/>
      </div>
    </div>
  );
};

export default TeamDashboard;
