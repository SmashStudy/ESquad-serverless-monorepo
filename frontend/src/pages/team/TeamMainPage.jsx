import React, { useState, useEffect} from 'react';
import { Link, useParams, useOutletContext, Outlet } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Button,
    Typography,
    InputBase,
    Dialog,
    DialogContent,
    Card,
    CardContent,
    CardActions,
    Grid,
    Fab
} from '@mui/material';
import { alpha, useTheme } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
const TeamMainPage = () => {
    const { selectedTeam, updateSelectedTeam, setSelectedTeam, setSelectedTab , updateTeams} = useOutletContext();
    const { teamId } = useParams(); // URL의 teamId 받아오기
    const [teamData, setTeamData] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const fetchTeamData = async () => {
            try {
                
                const response = await axios.get(`https://api.esquad.click/teams/${encodeURIComponent(teamId)}`);
                const teamData = response.data.data;
                
                setTeamData(teamData);
                setSelectedTeam(teamData);
                setSelectedTab(1);
            } catch (error) {
                console.error('팀 데이터를 불러오는 중 오류 발생:', error);
            } finally {
                setLoading(false);
            }
        };

        if (teamId) fetchTeamData();
    }, [teamId, setSelectedTeam]);
    
    return (
            <Box
                sx={{
                    // border: '1px solid',     // 추후 삭제
                    mb: 2,
                    height: '100%',
                    width: '100%',
                    overflowX: 'auto',
                    overflowY: 'auto',
                    position: 'relative',   // Added to make Fab relative to parent Box
                }}
            >   
                <h1>Selected Team: {selectedTeam ? selectedTeam.teamName : "No team selected"}</h1>
                <Outlet context={{selectedTeam, updateSelectedTeam, setSelectedTeam, setSelectedTab, updateTeams}}/>

            </Box>
    );
};

export default TeamMainPage;