import React, { useState, useEffect } from 'react';
import { Outlet } from "react-router-dom";
import {
    Box,
    CssBaseline,
} from '@mui/material';
import { useTheme, useMediaQuery } from '@mui/material';
import Appbar from "../../components/header/Appbar.jsx";
import SidebarComponent from "../../components/header/SidebarComponent.jsx";
import ChatDrawer from "../../components/right/ChatDrawer.jsx";
import TeamsProvider, { useTeams } from "../../context/TeamContext.jsx";

const HomeContent = () => {
    const theme = useTheme();
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));

    const [selectedTab, setSelectedTab] = useState(0);      // 0: 커뮤니티, 1: 팀
    const [selectedTeam, setSelectedTeam] = useState(null);         // 유저가 선택한 팀
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [chatDrawerOpen, setChatDrawerOpen] = useState(false);

    const [loading, setLoading] = useState(false);

    const {teams, updateSelectedTeam, updateTeams} = useTeams();

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

    const handleTabChange = (tabIndex) => {
        setSelectedTab((prev) => tabIndex);
        if(tabIndex !== 1) setSelectedTeam(null);   // 커뮤니티 선택 시 선택 팀 초기화
    }

    return (
        <Box sx={{ display: 'flex', height: '100vh', width: '100vw' }}>
            <CssBaseline />

            {/* AppBar/AppbarComponent */}
            <Appbar
                handleSidebarToggle={handleSidebarToggle}
                selectedTab={selectedTab}
                onTabChange={handleTabChange}   // Appbar 탭 변경 : 0 / 1
                changeSelectedTeam={setSelectedTeam}    // 유저가 선택한 팀 PK 설정 -> 사이드바에 뿌려주기 위함
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
                    onTabChange={handleTabChange}
                    selectedTeam={selectedTeam}
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
                    backgroundColor: theme.palette.background.default,
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
                    <Outlet context={{ selectedTab, selectedTeam }} onTabChange={handleTabChange} />
                </Box>

                {/* Right Section - Chat Area */}
                <ChatDrawer
                    isSmallScreen={isSmallScreen}
                    isMediumScreen={isMediumScreen}
                    teams={teams}
                    selectedTeam={selectedTeam}
                    toggleDrawer={toggleChatDrawer}
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
