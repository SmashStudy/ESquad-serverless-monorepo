import React,{useState,useEffect} from 'react';
import { useOutletContext, Outlet, useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import axios from 'axios';
import { getTeamApi } from '../../utils/apiConfig';
import {useTeams} from "../../context/TeamContext.jsx";
import {
    getTeamProfiles,
} from '../../utils/team/TeamApi.jsx';

const TeamMainPage = () => {
    const { selectedTeam, updateSelectedTeam, handleTab , updateTeams} = useTeams();
    const {teamId} = useParams();
    const [teamData, setTeamData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchTeamData = async () => {
        try {
            
            const teamProfile = await getTeamProfiles(teamId);
            console.log(`teamProfile: ${teamProfile}`);
            setTeamData(teamProfile);
        } catch (error) {
            console.error('팀 데이터를 불러오는 중 오류 발생:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedTeam?.PK) fetchTeamData();
      }, [selectedTeam]);

    useEffect(() => {
        fetchTeamData();
    }, []);
    

    return (
            <Box
                sx={{
                    mb: 2,
                    height: '100%',
                    width: '100%',
                    overflowX: 'auto',
                    overflowY: 'auto',
                    position: 'relative',
                }}
            >   
                <h1>{teamData?.teamName}</h1>
                <Outlet context={{selectedTeam, updateSelectedTeam, handleTab, updateTeams}}/>

            </Box>
    );
};

export default TeamMainPage;