import React,{useState,useEffect} from 'react';
import { useOutletContext, Outlet, useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import axios from 'axios';
import { getTeamApi } from '../../utils/apiConfig';

const TeamMainPage = () => {
    const { selectedTeam, updateSelectedTeam, handleTab , updateTeams} = useOutletContext();
    const {teamId} = useParams();
    const [teamData, setTeamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const ACCESS_TOKEN = localStorage.getItem('jwtToken');
    
    const fetchTeamData = async () => {
        try {
            
            const response = await axios.get(`${getTeamApi()}/${encodeURIComponent(teamId)}`,{
                headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                },
            });
            const teamDataForm = response.data.data;
            const parsedData = typeof teamDataForm === "string" ? JSON.parse(teamDataForm) : teamDataForm;
            if (teamDataForm?.PK !== selectedTeam?.PK || teamDataForm?.updatedAt !== selectedTeam?.updatedAt) {
                await updateSelectedTeam(parsedData);
             }
            // console.log(`페치팀 이후 ${JSON.stringify(teamDataForm)}`);
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
                <h1>Selected Team: {selectedTeam ? selectedTeam.teamName : "No team selected"}</h1>
                <Outlet context={{selectedTeam, updateSelectedTeam, handleTab, updateTeams}}/>

            </Box>
    );
};

export default TeamMainPage;