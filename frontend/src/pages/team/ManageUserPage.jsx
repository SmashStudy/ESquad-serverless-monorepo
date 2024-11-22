import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { Box, Button, Typography, List, ListItem, ListItemText, TextField } from '@mui/material';

const ManageUserPage = () => {
    const { selectedTeam } = useOutletContext();
    const { teamId } = useParams();
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState('');
    const [loading, setLoading] = useState(false);
    const [isManager, setIsManager] = useState(false); // 권한 상태
    const [isLoadingRole, setIsLoadingRole] = useState(true); // 권한 확인 로딩 상태

    // 팀 유저 데이터 가져오기
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

    // 권한 확인 API 호출
    const checkUserRole = async () => {
        try {
            const response = await axios.get(`https://api.esquad.click/teams/${encodeURIComponent(teamId)}/role`);
            console.log(response.data.data);
            setIsManager(response.data.data); // 권한 설정
        } catch (error) {
            console.error('Error checking role:', error);
            setIsManager(false); // 기본값 비활성화
        } finally {
            setIsLoadingRole(false);
        }
    };

    useEffect(() => {
        if (teamId) {
            fetchTeamUsers();
            checkUserRole(); // 권한 확인
        }
    }, [teamId]);

    // 유저 추가
    const handleAddUser = async () => {
        if (!newUser || users.length >= 12 || !isManager) return; // 권한 없거나 12명 이상 추가 불가
        try {
            await axios.put(`https://api.esquad.click/teams/${encodeURIComponent(teamId)}/setting/users`, {
                membersToAdd: [newUser],
                membersToDelete: [],
            });
            setUsers([...users, { userId: newUser }]);
            setNewUser('');
            fetchTeamUsers();
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };

    // 유저 삭제
    const handleDeleteUser = async (userId) => {
        if (users.length <= 4 || !isManager) return; // 권한 없거나 4명 이하 삭제 불가
        try {
            await axios.put(`https://api.esquad.click/teams/${encodeURIComponent(teamId)}/setting/users`, {
                membersToAdd: [],
                membersToDelete: [userId],
            });
            setUsers(users.filter((user) => user.SK !== userId));
            fetchTeamUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    // 권한 확인 로딩 상태 처리
    if (isLoadingRole) {
        return <Typography>Loading role information...</Typography>;
    }

    return (
        <Box>
            <Typography variant="h4">Manage Users for {selectedTeam?.teamName || teamId}</Typography>

            {/* 유저 리스트 */}
            <List>
                {users.map((user) => (
                    <ListItem key={user.SK}>
                        <ListItemText primary={user.SK} />
                        {/* 유저가 4명 이상이고 매니저일 때만 삭제 버튼 표시 */}
                        {users.length > 4 && isManager && (
                            <Button onClick={() => handleDeleteUser(user.SK)}>Delete</Button>
                        )}
                    </ListItem>
                ))}
            </List>

            {/* 유저 추가 */}
            <Box sx={{ mt: 2 }}>
                {users.length < 12 ? (
                    <>
                        <TextField
                            label="Add User"
                            value={newUser}
                            onChange={(e) => setNewUser(e.target.value)}
                            disabled={!isManager || loading} // 매니저가 아니면 비활성화
                        />
                        <Button onClick={handleAddUser} disabled={!isManager || loading}>
                            Add
                        </Button>
                    </>
                ) : (
                    <Typography color="error">Cannot add more than 12 users.</Typography>
                )}
            </Box>
        </Box>
    );
};

export default ManageUserPage;
