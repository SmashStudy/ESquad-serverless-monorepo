import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { Box, Button, Typography, List, ListItem, ListItemText, TextField, Card, CardContent, CardActions, Divider } from '@mui/material';
import { jwtDecode } from 'jwt-decode';

const ManageUserPage = () => {
    const { selectedTeam } = useOutletContext();
    const { teamId } = useParams();
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState('');
    const [loading, setLoading] = useState(false);
    const [isManager, setIsManager] = useState(false);
    const [isLoadingRole, setIsLoadingRole] = useState(true);
    const token = localStorage.getItem('jwtToken');

    const fetchTeamUsers = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`https://api.esquad.click/teams/${encodeURIComponent(teamId)}/user`);
            setUsers(response.data.data);
        } catch (error) {
            console.error('Error fetching team users:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkUserRole = async () => {
        try {
            const response = await axios.post(`https://api.esquad.click/teams/${encodeURIComponent(teamId)}/role`, {
                userId: jwtDecode(token).email
            });
            setIsManager(response.data.data);
        } catch (error) {
            console.error('Error checking role:', error);
            setIsManager(false);
        } finally {
            setIsLoadingRole(false);
        }
    };

    useEffect(() => {
        if (teamId) {
            fetchTeamUsers();
            checkUserRole();
        }
    }, [teamId]);

    const handleAddUser = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // 이메일 유효성 검사 정규식
    
        if (!newUser || users.length >= 12 || !isManager) return;
    
        // 이메일 형식 검증
        if (!emailRegex.test(newUser)) {
            alert('유효한 이메일 주소를 입력해 주세요.');
            return;
        }
    
        try {
            await axios.put(`https://api.esquad.click/teams/${encodeURIComponent(teamId)}/setting/users`, {
                membersToAdd: [newUser],
                membersToDelete: [],
            });
            setNewUser(''); // 입력 필드 초기화
            fetchTeamUsers(); // 사용자 목록 새로고침
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };
    const handleDeleteUser = async (userId) => {
        if (users.length <= 4 || !isManager) return;
        try {
            await axios.put(`https://api.esquad.click/teams/${encodeURIComponent(teamId)}/setting/users`, {
                membersToAdd: [],
                membersToDelete: [userId],
            });
            fetchTeamUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    if (isLoadingRole) {
        return <Typography>Loading role information...</Typography>;
    }

    return (
        <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4, p: 2, bgcolor: '#f9f9f9', borderRadius: 2 }}>
            <Typography variant="h4" sx={{ mb: 2, textAlign: 'center', color: '#4a4a4a' }}>
                Manage Users for {selectedTeam?.teamName || teamId}
            </Typography>

            <Card variant="outlined" sx={{ mb: 2, borderRadius: 2, boxShadow: 1 }}>
                <CardContent>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                        Team Members
                    </Typography>
                    <List>
                        {users.map((user) => (
                            <ListItem
                                key={user.SK}
                                sx={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    bgcolor: '#fff',
                                    borderRadius: 1,
                                    mb: 1,
                                    boxShadow: 1,
                                }}
                            >
                                <Box>
                                    <ListItemText
                                        primary={user.SK}
                                        secondary={`Invite State: ${user.inviteState || 'N/A'}`}
                                    />
                                </Box>
                                {users.length > 4 && isManager && (
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        size="small"
                                        onClick={() => handleDeleteUser(user.SK)}
                                    >
                                        Delete
                                    </Button>
                                )}
                            </ListItem>
                        ))}
                    </List>
                </CardContent>
            </Card>

            <Divider sx={{ mb: 2 }} />

            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    p: 2,
                    bgcolor: '#eaf4fc',
                    borderRadius: 2,
                    boxShadow: 1,
                }}
            >
                <TextField
                    label="Add User"
                    value={newUser}
                    onChange={(e) => setNewUser(e.target.value)}
                    fullWidth
                    disabled={!isManager || loading}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddUser}
                    disabled={!isManager || loading}
                >
                    Add
                </Button> 
            </Box>
        </Box>
    );
};

export default ManageUserPage;
