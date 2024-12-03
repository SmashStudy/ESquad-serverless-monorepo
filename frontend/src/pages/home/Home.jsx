import React, { useState, useEffect } from 'react';
import { Outlet } from "react-router-dom";
import {
    Box,
    CssBaseline,
} from '@mui/material';
import { useTheme, useMediaQuery } from '@mui/material';
import AppBarComponent from "../../components/header/AppbarComponent.jsx";
import SidebarComponent from "../../components/header/SidebarComponent.jsx";
import ChatDrawer from "../../components/right/ChatDrawer.jsx";
import TeamsProvider, { useTeams } from "../../context/TeamContext.jsx";

const HomeContent = () => {
  const theme = useTheme();
  const [selectedTab, setSelectedTab] = useState(0);      // 0: 커뮤니티, 1: 팀
  const [sidebarOpen, setSidebarOpen] = useState(true); 
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
  const {
        teams, selectedTeam, fetchTeams, updateSelectedTeam, updateTeams,
  } = useTeams();

  const toggleChatDrawer = () => {
    setChatDrawerOpen((prevState) => !prevState);
  };
  
  const handleSidebarToggle = () => {
    if (isSmallScreen) {
      setDrawerOpen(true);
    } else {
      setSidebarOpen(!sidebarOpen);
    }
  };

  const handleDrawerClose = () => { setDrawerOpen(false); };

  const handleTab = (tabIndex) => {
    setSelectedTab(tabIndex);
    if(tabIndex!==1) updateSelectedTeam("");
  }

  // 목록에서 선택된 팀
  const changeSelectedTeam = (i) => {
    const newSelectedTeam = teams[i];
    if (!newSelectedTeam) {
      console.warn('선택된 팀이 존재하지 않습니다.');
      return;
    }

    updateSelectedTeam(newSelectedTeam);
    handleTab(1);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh', width: '100vw' }}>
      <CssBaseline />

        {/* AppBar/AppbarComponent */}
        <AppBarComponent
          handleSidebarToggle={handleSidebarToggle}
          selectedTab={selectedTab}
          handleTab={handleTab}
          toggleChatDrawer={toggleChatDrawer}
        />

        <ChatDrawer
          isSmallScreen={isSmallScreen}
          isMediumScreen={isMediumScreen}
          teams={teams}
          selectedTeam={selectedTeam}
          isOpen={chatDrawerOpen}
          toggleDrawer={toggleChatDrawer}
        />

        {/* Home Content Area with Sidebar */}  
        <Box
          component="main"
          sx={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            height: 'calc(100vh - 57px)',
            marginTop: '57px',
          }}
        >
          {/* Render Drawer instead of Sidebar when the screen width is less than 600px */}
          <SidebarComponent
            isSmallScreen={isSmallScreen}
            drawerOpen={drawerOpen}
            sidebarOpen={sidebarOpen}
            handleDrawerClose={handleDrawerClose}
            selectedTab={selectedTab}
            // selectedTeam={selectedTeam}
          />

          {/* Home Content Area - Sidebar 제외한 나머지 body 영역 */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: isMediumScreen ? 'column' : 'row',
              flexGrow: 1,
              py: 2,      
              px: 2,      
              gap: 1,     
              transition: 'width 0.3s ease',
              backgroundColor: '#fff',
            }}
          >

          {/* Left Section - Community / Team Content */}
          <Box
            sx={{
              flex: isMediumScreen ? 6 : 7,
              flexDirection: 'row',
              gap: 1,
              height: isMediumScreen ? '60%' : '100%',
            }}
          >
            <Outlet context={{ selectedTeam, updateSelectedTeam, handleTab, updateTeams }}/>
          </Box>

          {/* Right Section - Chat Area */}
          <ChatDrawer
            isSmallScreen={isSmallScreen}
            isMediumScreen={isMediumScreen}
            teams={teams}
            selectedTeam={selectedTeam}
            toggleDrawer={toggleChatDrawer}
            // user={user}
          />
        </Box>
      </Box>
    </Box>
  );
};

const Home = () => (
    <TeamsProvider>
      <HomeContent />
    </TeamsProvider>
);

export default Home;
