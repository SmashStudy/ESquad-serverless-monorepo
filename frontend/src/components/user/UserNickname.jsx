import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Home as HomeIcon,
  Dashboard as DashboardIcon,
  Category as CategoryIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NicknameEditor = () => {
  const [nickname, setNickname] = useState('');
  const [newNickname, setNewNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // 닉네임 가져오기 함수
  const fetchNickname = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('https://api.esquad.click/dev/users/get-nickname', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
        },
      });
      setNickname(response.data.nickname);
      setNewNickname(response.data.nickname);
    } catch (err) {
      setError('닉네임을 가져오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 닉네임 업데이트 함수
  const updateNickname = async () => {
    if (newNickname.trim().length < 2 || newNickname.trim().length > 10) {
      setError('닉네임은 2자 이상, 10자 이하여야 합니다.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await axios.put(
        'https://api.esquad.click/dev/users/update-nickname',
        { nickname: newNickname },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
          },
        }
      );
      setSuccess('닉네임이 성공적으로 업데이트되었습니다.');
      setNickname(newNickname);
    } catch (err) {
      if (err.response?.status === 500) {
        setError('이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('닉네임 업데이트 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 로드 시 닉네임 가져오기
  useEffect(() => {
    fetchNickname();
  }, []);

  const handleLogout = () => {
    navigate('/logout');
    alert('로그아웃 되었습니다. 다음에 또 만나요!');
  };

  return (
    <Box sx={{ display: 'flex', height: 'calc(98vh - 55px)', backgroundColor: '#f5f5f5' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 240,
          backgroundColor: '#fff',
          color: '#000',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 2,
        }}
      >
        <Box>
          <List>
            <ListItem button onClick={() => navigate('/user/profile')}>
              <ListItemIcon>
                <HomeIcon sx={{ color: 'inherit' }} />
              </ListItemIcon>
              <ListItemText primary="Home" />
            </ListItem>
            <ListItem button>
              <ListItemIcon>
                <DashboardIcon sx={{ color: 'inherit' }} />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button onClick={() => navigate('/user/profile/category')}>
              <ListItemIcon>
                <CategoryIcon sx={{ color: 'inherit' }} />
              </ListItemIcon>
              <ListItemText primary="Category" />
            </ListItem>
            <ListItem button onClick={() => navigate('/user/profile/nickname')}>
              <ListItemIcon>
                <PersonIcon sx={{ color: 'inherit' }} />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>
            <ListItem button>
              <ListItemIcon>
                <SettingsIcon sx={{ color: 'inherit' }} />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>
          </List>
        </Box>

        {/* Logout Button */}
        <List>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon sx={{ color: 'inherit' }} />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, padding: 3 }}>
        <Card>
          <CardContent>
            <Typography variant="h6" sx={{ marginBottom: 2 }}>
              닉네임 관리
            </Typography>

            {loading && <CircularProgress />}

            {error && (
              <Alert severity="error" sx={{ marginBottom: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ marginBottom: 2 }}>
                {success}
              </Alert>
            )}

            {!loading && (
              <>
                <Typography variant="body1" sx={{ marginBottom: 2 }}>
                  현재 닉네임: <strong>{nickname}</strong>
                </Typography>
                <TextField
                  label="새 닉네임"
                  variant="outlined"
                  fullWidth
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  sx={{ marginBottom: 2 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={updateNickname}
                  disabled={loading}
                >
                  닉네임 업데이트
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
};

export default NicknameEditor;
