import React, { useState } from 'react';
import { Outlet } from "react-router-dom";
import {
    Box,
    CssBaseline,
} from '@mui/material';
import { useTheme, useMediaQuery } from '@mui/material';
import AppBarComponent from "../../components/header/AppbarComponent.jsx";
import SidebarComponent from "../../components/header/SidebarComponent.jsx";
import ChatDrawer from "../../components/right/ChatDrawer.jsx";
import StudyPage from "../team/study/StudyPage.jsx";
import {useUser} from "../../components/form/UserContext.jsx";
import axios from "axios";
import {fetchTeam} from "../../hooks/fetchTeam.jsx";
import {jwtDecode} from 'jwt-decode'; 

const Home = () => {
    const theme = useTheme();
    const [selectedTab, setSelectedTab] = useState(0);      // 0: 커뮤니티, 1: 팀
    const [sidebarOpen, setSidebarOpen] = useState(true); 
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null); // 
    const isMediumScreen = useMediaQuery(theme.breakpoints.down('lg'));
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const token = localStorage.getItem('jwtToken');
    
    useEffect(() => {
        
        const fetchTeams = async () => {
            try {
                setLoading(true);
                const responseTeamId = await axios.post('https://api.esquad.click/teams/get',{
                        userId: jwtDecode(token).email,
                    }
                );
                const teamIds = responseTeamId.data.data; // 팀 ID 배열
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
                console.error('Error fetching teams:', error);
                return null;
            } finally {
                setLoading(false); 
            }
        };
        fetchTeams();
    }, []); 
    
    const [chatDrawerOpen, setChatDrawerOpen] = useState(false);
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
        setSelectedTeam(null);
    }

    const changeSelectedTeam = (i) => {

        const newSelectedTeam = teams[i];
        if (!newSelectedTeam) {
            console.warn('선택된 팀이 존재하지 않습니다.');
            return;
        }
    
        if (selectedTeam?.PK !== newSelectedTeam.PK || selectedTeam === null) {
            setSelectedTeam(newSelectedTeam);
            if (selectedTab !== 1) setSelectedTab(1);
        }
    };

    const updateSelectedTeam = (updatedTeam) => {
        setTeams((prevTeams) =>
            prevTeams.map((team) =>
                team.PK= updatedTeam.PK ? updatedTeam : team
            )
        );
        setSelectedTeam(updatedTeam);
    };

    const updateTeams = async (team) => {
        try {
            const res = await axios.get(`https://api.esquad.click/teams/${encodeURIComponent(team.teamId)}`);
            setTeams((prevTeams) => {            
                if (prevTeams.some((t) => t.PK === res.data.data.PK)) {
                    return prevTeams; 
                }
                return [...prevTeams, res.data.data];
            });
        } catch (error) {
            console.error('Error fetching team:', error);
        }
    };

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

                        <Outlet context={{ selectedTeam, updateSelectedTeam, changeSelectedTeam, setSelectedTeam, setSelectedTab, updateTeams }}/>
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

export default Home;
