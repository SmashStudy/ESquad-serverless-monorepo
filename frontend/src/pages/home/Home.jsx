import React, { useState, useEffect } from 'react';
import { Outlet } from "react-router-dom";
import {
    IconButton,
    Typography,
    Box,
    CssBaseline,
    InputBase,
    Button,
    Avatar,
} from '@mui/material';
import { useTheme, useMediaQuery, styled, alpha } from '@mui/material';
import AppBarComponent from "../../components/header/AppbarComponent.jsx";
import SidebarComponent from "../../components/header/SidebarComponent.jsx";
import PostListPage from "../community/PostListPage.jsx";
import ChatDrawer from "../../components/right/ChatDrawer.jsx";
import StudyPage from "../team/study/StudyPage.jsx";
import {useUser} from "../../components/form/UserContext.jsx";
import axios from "axios";
import {fetchTeam} from "../../hooks/fetchTeam.jsx";

const Home = () => {
    const theme = useTheme();
    const [selectedTab, setSelectedTab] = useState(0);      // 0: 커뮤니티, 1: 팀
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [teams, setTeams] = useState([
        // { "teamName": "none" },
        { "id": 21, "teamName": "문법존" },
        { "id": 28, "teamName": "몬다니" },
        { "id": 24, "teamName": "문법존2" },
        { "id": 22, "teamName": "몬다니2" },
        { "id": 23, "teamName": "문법존3" },
        { "id": 41, "teamName": "몬다니4" },
    ]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));     // Below 1200px
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));      // Below 900px

    const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
    const toggleChatDrawer = () => {
        setChatDrawerOpen((prevState) => !prevState);
    };
    // const accessToken= localStorage.getItem('jwt');
    // const user = useUser();

    // useEffect(() => {
    //     if(accessToken) {
    //         // alert(accessToken);
    //         fetchTeam()
    //             .then((response) => {
    //                 console.log(response);
    //                 response == null ? setTeams([]) : setTeams(response);
    //             }).catch((error) => {
    //             console.log(error);
    //         });
    //     }
    // }, [accessToken]);

    // Toggle the sidebar or open the drawer based on screen size
    const handleSidebarToggle = () => {
        if (isSmallScreen) {
            setDrawerOpen(true);
        } else {
            setSidebarOpen(!sidebarOpen);
        }
    };

    // Close the drawer
    const handleDrawerClose = () => { setDrawerOpen(false); };

    // set selectedTab
    const handleTab = (tabIndex) => {
        setSelectedTab(tabIndex);
        setSelectedTeam(null);
    }

    // update selectedTeam
    const updateSelectedTeam = (i) => {
        const changeSelectTeam = teams[i];
        if (selectedTeam?.id !== changeSelectTeam.id || selectedTeam == null) {
            setSelectedTeam(changeSelectTeam);
            if(selectedTab !== 1) setSelectedTab(1);
        }
    };

    const updateTeams = (team) => {
        setTeams(...teams, team);
    }

    // console.log(teams);

    return (
        <Box sx={{ display: 'flex', height: '100vh', width: '100vw' }}>
            <CssBaseline />

            {/* AppBar/AppbarComponent */}
            <AppBarComponent
                handleSidebarToggle={handleSidebarToggle}
                handleTab={handleTab}
                selectedTab={selectedTab}
                updateSelectedTeam={updateSelectedTeam}
                updateTeams={updateTeams}
                teams={teams}
                toggleChatDrawer={toggleChatDrawer} // 이 부분 추가
            />

            <ChatDrawer
                isSmallScreen={isSmallScreen}
                isMediumScreen={isMediumScreen}
                teams={teams}
                selectedTeam={selectedTeam}
                isOpen={chatDrawerOpen} // 상태 전달
                toggleDrawer={toggleChatDrawer} // 핸들러 전달
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
                    selectedTeam={selectedTeam}
                />

                {/* Home Content Area - Sidebar 제외한 나머지 body 영역 */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: isMediumScreen ? 'column' : 'row',
                        flexGrow: 1,
                        py: 2,      // warn
                        px: 2,      // warn
                        gap: 1,     // Community area 와 chat area gap
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

                        <Outlet />
                    </Box>

                    {/* Right Section - Chat Area */}
                    <ChatDrawer
                        isSmallScreen={isSmallScreen}
                        isMediumScreen={isMediumScreen}
                        teams={teams}
                        selectedTeam={selectedTeam}
                        // user={user}
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default Home;