import React,{useState,useEffect} from 'react';
import { useOutletContext, Outlet, useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import axios from 'axios';
import { getTeamApi } from '../../utils/apiConfig';
import {useTeams} from "../../context/TeamContext.jsx";
import {
    getTeamProfiles,
} from '../../utils/team/TeamApi.jsx';
import Loading from "../../components/custom/Loading.jsx";

const TeamMainPage = () => {
    const { selectedTeam, handleTab , updateTeams} = useTeams();
    const {teamId} = useParams();
    const [teamData, setTeamData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTeamData = async () => {
        try {
            setIsLoading(true);
            const teamProfile = await getTeamProfiles(teamId);
            setTeamData(teamProfile);
        } catch (error) {
            console.error('팀 데이터를 불러오는 중 오류 발생:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTeamData();
      }, [teamId]);
    
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
            {isLoading ? <Loading /> : (
                <>
                    <h1>{teamData?.teamName}</h1>
                    <Outlet context={{selectedTeam, handleTab, updateTeams}}/>
                </>
            )}
        </Box>
    );
};

export default TeamMainPage;