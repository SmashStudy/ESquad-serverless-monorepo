import React, { useState, useEffect } from 'react';
import { useOutletContext, Outlet, useParams } from 'react-router-dom';
import { Box } from '@mui/material';
import {useTeams} from "../../context/TeamContext.jsx";
import {
    getTeamProfiles,
} from '../../utils/team/TeamApi.jsx';
import Loading from "../../components/custom/Loading.jsx";
import { Tab, Tabs,Typography, Grid2, Paper, Button } from "@mui/material";

import LiveActivityMonitor from "./analystic/LiveActivityMonitor";  // 실시간 보드 컴포넌트
import TeamDataDashboard from "./analystic/Team";

const TeamMainPage = () => {
    const { selectedTeam, handleTab , updateTeams} = useTeams();
    const { teamId } = useParams();
    const teamIds = 'TEAM#b2c5dfb5-7a03-4fcb-b8b7-c23be94d9f66';
    const [teamData, setTeamData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedBoard, setSelectedBoard] = useState("live");  // "live" 또는 "team"
    const [selectedStat, setSelectedStat] = useState('월별');

    const handleBoardChange = (boardType) => {
        setSelectedBoard(boardType);
    };

    const handleTabChange = (event, newValue) => {
        setSelectedStat(newValue); // 선택된 통계 타입을 업데이트
    };

    const fetchTeamData = async () => {
        try {
            setLoading(true);
            const teamProfile = await getTeamProfiles(teamId);
            console.log(teamData);
            
            setTeamData(teamProfile);
            setLoading(false);

        } catch (error) {
            console.error('팀 데이터를 불러오는 중 오류 발생:', error);
        }
    }
    
    useEffect(() => {
        fetchTeamData();
    }, [teamId]);
    
    return (
        <>
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
            {loading ? <Loading /> : (
                <>
                    <Box sx={{ padding: 2, backgroundColor: '#f5f5f5', minHeight:'90vh' }}>
                        {/* 제목 및 보드 토글 버튼 */}
                        <Grid2 container spacing={3} alignItems="center" >
                            <Grid2 item xs={6}>
                                <Typography variant="h3" align="left" sx={{ fontSize: "24px" }}>
                                    {teamData?.teamName}의 데이터 대시보드
                                </Typography>
                            </Grid2>
                            <Grid2 item sx={{ display: 'flex', alignItems: 'center' }}>
                                {/* 보드 토글 버튼 */}
                                <Button
                                    variant={selectedBoard === "live" ? "contained" : "outlined"}
                                    color="primary"
                                    onClick={() => handleBoardChange("live")}
                                    sx={{ marginRight: 2 }}
                                >
                                    실시간 보드
                                </Button>
                                <Button
                                    variant={selectedBoard === "team" ? "contained" : "outlined"}
                                    color="primary"
                                    onClick={() => handleBoardChange("team")}
                                >
                                    팀 데이터 보드
                                </Button>

                                {/* 팀 데이터 보드일 때만 탭을 보여줌 */}
                                {selectedBoard === 'team' && (
                                    <Box sx={{ marginLeft: 3 }}>
                                        <Tabs value={selectedStat} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
                                            <Tab label="월별" value="월별" />
                                            <Tab label="주별" value="주별" />
                                            <Tab label="년별" value="년별" />
                                        </Tabs>
                                    </Box>
                                )}
                            </Grid2>
                        </Grid2>
                        {/* 보드 시각화 */}
                        <Box >
                            {selectedBoard === "live" ? (
                                <LiveActivityMonitor teamId={teamIds} stat={selectedStat} />
                            ) : (
                                <TeamDataDashboard teamId={teamIds} stat={selectedStat} />
                            )}
                        </Box>
                    </Box>
                </>
                )} 
            </Box>
        </>        
    );
};

export default TeamMainPage ;