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
    const [loading, setLoading] = useState(false);
    const [teams, setTeams] = useState([
        {teamId: 'TEAM#001', teamName: 'team001'},
        {teamId: 'TEAM#002', teamName: 'team002'}
    ]);
    const [selectedTeam, setSelectedTeam] = useState(null); // 
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));     // Below 1200px 반응형
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));      // Below 900px 반응형

    useEffect(() => {
        // 비동기 함수 정의
        const fetchTeams = async () => {
            try {
                setLoading(true); // 로딩 시작

                // 1. 팀 ID 리스트 가져오기
                const responseTeamId = await axios.get('https://api.esquad.click/teams');
                const teamIds = responseTeamId.data.data; // 팀 ID 배열

                // 2. 각 팀의 프로필 데이터 가져오기
                const teamProfilesPromises = teamIds.map(async (teamId) =>{
                    const encodedTeamId = encodeURIComponent(teamId); 
                    
                    const res = await axios.get(`https://api.esquad.click/teams/${encodedTeamId}`);
                    return res.data.data;
                });
                const teamProfiles = await Promise.all(teamProfilesPromises);
                
                setTeams(teamProfiles);
                setTeams((prevTeams) =>
                    [...prevTeams].sort((a, b) => a.teamName.localeCompare(b.teamName))
                );
            } catch (error) {
                console.log('에러남')
                console.error('Error fetching teams:', error);
                return null;
            } finally {
                setLoading(false); // 로딩 종료
            }
        };

        // 비동기 함수 호출
        fetchTeams();
    }, []); // 종속성 배열 비워둠(마운트 시 한 번 실행)
    
    const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
    const toggleChatDrawer = () => {
        setChatDrawerOpen((prevState) => !prevState);
    };
    // const accessToken= localStorage.getItem('jwt');
    // const user = useUser();


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
    const changeSelectedTeam = (i) => {

        const changeSelectTeam = teams[i];
        if (selectedTeam?.PK!== changeSelectTeam.PK || selectedTeam == null) {
            setSelectedTeam(changeSelectTeam);
            if(selectedTab !== 1) setSelectedTab(1);
        }
    };

    // UpdateSelectedTeam에 수정된 팀 정보를 전달하여 상태를 업데이트
    const updateSelectedTeam = (updatedTeam) => {
        setTeams((prevTeams) =>
            prevTeams.map((team) =>
                team.PK= updatedTeam.PK ? updatedTeam : team
            )
        );
        setSelectedTeam(updatedTeam); // 현재 선택된 팀도 업데이트
    };


    const updateTeams = (team) => {
        setTeams((prevTeams) => [...prevTeams, team]);
    }

    return (
        <Box sx={{ display: 'flex', height: '100vh', width: '100vw' }}>
            <CssBaseline />

            {/* AppBar/AppbarComponent */}
            <AppBarComponent
                handleSidebarToggle={handleSidebarToggle}
                handleTab={handleTab}
                selectedTab={selectedTab}
                changeSelectedTeam={changeSelectedTeam}
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

                        <Outlet context={{ selectedTeam, updateSelectedTeam, setSelectedTeam, setSelectedTab }}/>
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