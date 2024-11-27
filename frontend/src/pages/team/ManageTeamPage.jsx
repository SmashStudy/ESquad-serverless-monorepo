import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
    Box,
    Button,
    Typography,
    TextField,
    Card,
    CardContent,
    CardActions,
} from '@mui/material';
import { jwtDecode } from 'jwt-decode';

const ManageTeamPage = () => {
    const { selectedTeam, updateSelectedTeam, setSelectedTeam, setSelectedTab } = useOutletContext();
    const { teamId } = useParams();
    const navigate = useNavigate();
    const token = localStorage.getItem('jwtToken');

    const [isManager, setIsManager] = useState(false);
    const [isTeamNameAvailable, setIsTeamNameAvailable] = useState(null);
    const [isTeamNameChecked, setIsTeamNameChecked] = useState(false);
    const [isUpdated, setIsUpdated] = useState(false);
    const [loading, setLoading] = useState(false);
    
    const [teamName, setTeamName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (selectedTeam) {
            setTeamName(selectedTeam.teamName);
            setDescription(selectedTeam.description);
            setIsUpdated(false); 
        }
        checkRole();

    }, [selectedTeam]);

       // 팀 이름 변경 시 처리
       useEffect(() => {
        if (selectedTeam && teamName === selectedTeam.teamName) {
            // 사용자가 현재의 팀 이름을 입력한 경우
            setIsTeamNameAvailable(true);
            setIsTeamNameChecked(true);
        } else {
            setIsTeamNameAvailable(null);
            setIsTeamNameChecked(false);
        }
    }, [teamName, selectedTeam]);
    const checkRole = async () => {
        try {
            const response = await axios.post(`https://api.esquad.click/teams/${encodeURIComponent(teamId)}/role`,{
                userId: jwtDecode(token).email,
            });
            setIsManager(response.data.data);
        } catch (error) {
            console.error('Error checking role:', error);
            setIsManager(false);
        }
    };

    const handleCheckTeamName = async () => {
        
        if (!teamName) return alert('팀 이름을 입력해주세요.');
        if (selectedTeam && teamName === selectedTeam.teamName) {
            setIsTeamNameAvailable(true);
            setIsTeamNameChecked(true);
            alert('현재 사용 중인 팀 이름입니다.');
            return;
        }
        try {
            setLoading(true);
            const response = await axios.get(`https://api.esquad.click/teams/check-name/${encodeURIComponent(teamName)}`);
            
            setIsTeamNameAvailable(response.data.isAvailable);
            setIsTeamNameChecked(true);
            alert(response.data.message);
        } catch (error) {
            console.error('Error checking team name:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateTeam = async () => {
        if (!teamName || !description) return alert('팀 이름과 설명을 모두 입력해주세요.');

        try {
            setLoading(true);
            const response = await axios.put(`https://api.esquad.click/teams/${encodeURIComponent(teamId)}/settings/info`, {
                teamName,
                description,
            });
            alert('팀 정보가 성공적으로 업데이트되었습니다.');

            updateSelectedTeam(response.data.data);
            setIsUpdated(false);
            setIsTeamNameChecked(false);   
            setIsTeamNameAvailable(null);
        } catch (error) {
            console.error('Error updating team:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteTeam = async () => {
        const confirmDelete = window.confirm('정말로 이 팀을 삭제하시겠습니까?');
        if (!confirmDelete) return;
    
        try {
            setLoading(true);
            await axios.delete(`https://api.esquad.click/teams/${encodeURIComponent(teamId)}/settings`);
            alert('팀이 성공적으로 삭제되었습니다.');

            setSelectedTeam(null);
            setSelectedTab(0);
            navigate('/');
            window.location.reload();
        } catch (error) {
            console.error('Error deleting team:', error);
            alert('팀 삭제에 실패했습니다. 다시 시도해주세요.');
        } finally {
            setLoading(false);
        }
    };
    
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
            <Typography variant="h4" gutterBottom>
                팀 관리
            </Typography>

            <Card>
                <CardContent>
                    <Typography variant="h6">팀 정보</Typography>
                    <TextField
                        label="팀 이름"
                        value={teamName}
                        onChange={(e) => {
                            setTeamName(e.target.value);
                            setIsTeamNameChecked(false);
                            setIsUpdated(true);
                        }}
                        fullWidth
                        disabled={!isManager || loading} 
                        sx={{ mb: 2 }}
                    />
                    <Button onClick={handleCheckTeamName} disabled={loading||!isManager}>
                        팀 이름 중복 확인
                    </Button>
                    {isTeamNameAvailable !== null && (
                        <Typography variant="body2" color={isTeamNameAvailable ? 'green' : 'red'}>
                            {isTeamNameAvailable ? '사용 가능한 이름입니다.' : '이미 존재하는 이름입니다.'}
                        </Typography>
                    )}

                    <TextField
                        label="팀 설명"
                        value={description}
                        onChange={(e) => {
                            setDescription(e.target.value);
                            setIsUpdated(true);}
                        }
                        multiline
                        rows={4}
                        fullWidth
                        disabled={!isManager || loading}
                        sx={{ mb: 2 }}
                    />
                </CardContent>
                <CardActions>
                    <Button
                        onClick={handleUpdateTeam}
                        color="primary"
                        variant="contained"
                        disabled={
                            loading ||
                            !isTeamNameChecked || // 중복 확인이 되지 않은 경우 비활성화
                            (isTeamNameAvailable === false) || // 중복된 이름인 경우 비활성화
                            !isManager || !isUpdated
                        }
                    >
                        팀 수정
                    </Button>
                    <Button onClick={handleDeleteTeam} color="error" variant="contained" disabled={!isManager || loading}>
                        팀 삭제
                    </Button>
                </CardActions>
            </Card>
        </Box>
    );
};

export default ManageTeamPage;
