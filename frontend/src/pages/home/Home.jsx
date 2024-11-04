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
import ChatArea from "../../components/right/ChatArea.jsx";
import StudyPage from "../team/StudyPage.jsx";
import {useUser} from "../../components/form/UserContext.jsx";
import axios from "axios";
import {fetchTeam} from "../../hooks/fetchTeam.jsx";

const Home = () => {
    const theme = useTheme();
    const [selectedTab, setSelectedTab] = useState(0);      // 0: 커뮤니티, 1: 팀
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedSidebarItem, setSelectedSidebarItem] = useState(null);
    const [teams, setTeams] = useState([{
        "teamName": "none",
    }]);
    // const [teamName, setTeamName] = useState(...teams)
    const [selectedTeam, setSelectedTeam] = useState(null);
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));     // Below 1200px
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));      // Below 900px
    const isVerySmallScreen = useMediaQuery('(max-width: 30vw)');

    const accessToken= localStorage.getItem('jwt');
    const user = useUser();

    // useAxios 커스텀 훅을 사용하여 POST 요청 설정
    // useEffect(() => {
    //     if (accessToken) {
    //         fetchTeam()
    //             .then((response) => {
    //                 setTeams(response);
    //             }).catch((error) => {
    //             console.log(error);
    //         });
    //     }
    // }, [accessToken]);
    //
    // // Listen for changes in localStorage and update accessToken state
    // useEffect(() => {
    //     const handleStorageChange = () => {
    //         setAccessToken(localStorage.getItem('accessToken'));
    //     };
    //     window.addEventListener('storage', handleStorageChange);
    //
    //     return () => {
    //         window.removeEventListener('storage', handleStorageChange);
    //     };
    // }, []);

    useEffect(() => {
        if(accessToken) {
            // alert(accessToken);
            fetchTeam()
                .then((response) => {
                    console.log(response);
                    response == null ? setTeams([]) : setTeams(response);
                }).catch((error) => {
                console.log(error);
            });
        }
    }, [accessToken]);

    // useEffect to log the selected team after it updates ( 확인용 )
    useEffect(() => {
        if (selectedTeam !== null) {
            console.log(`Selected tab : ${JSON.stringify(selectedTab)}, selected team : ${JSON.stringify(selectedTeam)}`);
        }
        if(selectedTab === 0) {
            console.log(`Selected tab : ${JSON.stringify(selectedTab)}, selected team : ${JSON.stringify(selectedTeam)}`);
        }
    }, [selectedTab, selectedTeam]);

    // Toggle the sidebar or open the drawer based on screen size
    const handleSidebarToggle = () => {
        if (isSmallScreen) {
            setDrawerOpen(true);
        } else {
            setSidebarOpen(!sidebarOpen);
        }
    };

    // Close the drawer
    const handleDrawerClose = () => {
        setDrawerOpen(false);
    };

    // set selectedTab
    const handleTabState = (i) => {
        if(selectedTab !== i) {
            setSelectedTab(0);
            setSelectedTeam(null);
        }
    }

    // update selectedTeam
    const updateTeamState = (i) => {
        if (teams == null) {
            return; // Prevent setting a selected team if there are no teams available
        }

        const changeSelectTeam = teams[i];
        if (selectedTeam?.id !== changeSelectTeam.id) {
            setSelectedTab(1);
            setSelectedTeam(changeSelectTeam);
        }
    };

    console.log(teams);
    return (
        <Box sx={{ display: 'flex', height: '100vh', width: '100vw' }}>
            <CssBaseline />

            {/* AppBar/AppbarComponent */}
            <AppBarComponent
                handleSidebarToggle={handleSidebarToggle}
                handleTab={handleTabState}
                selectedTab={selectedTab}
                teams={teams}
                updateTeam={updateTeamState}
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
                            // border: '1px solid',        // Community / team area border
                            flex: isMediumScreen ? 6 : 7,
                            flexDirection: 'row',
                            gap: 1,
                            height: isMediumScreen ? '60%' : '100%',
                        }}
                    >

                        <Outlet />
                    </Box>

                    {/* Right Section - Chat Area */}
                    <ChatArea
                        isSmallScreen={isSmallScreen}
                        isMediumScreen={isMediumScreen}
                        teams={teams}
                        selectedTeam={selectedTeam}
                        user={user}
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default Home;