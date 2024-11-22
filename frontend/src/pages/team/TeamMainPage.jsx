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
    const { selectedTeam, updateSelectedTeam, setSelectedTeam, setSelectedTab } = useOutletContext();
    const { teamId } = useParams(); // URL의 teamId 받아오기
    const [teamData, setTeamData] = useState(null);
    const [loading, setLoading] = useState(true);

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
                <h1>Selected Team: {selectedTeam ? selectedTeam.description : "No team selected"}</h1>
                <Outlet context={{selectedTeam, updateSelectedTeam, setSelectedTeam, setSelectedTab}}/>

            </Box>
    );
};

export default TeamMainPage;
