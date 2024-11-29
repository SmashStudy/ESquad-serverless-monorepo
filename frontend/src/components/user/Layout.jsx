import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, List, ListItem, ListItemIcon, ListItemText, Avatar, Typography, ListItemButton } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import {getUserApi} from "../../utils/apiConfig.js";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('jwtToken');

      if (!token) {
        throw new Error('로그인이 필요합니다.');
      }

      const response = await axios.get(`${getUserApi()}/get-user-info`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserInfo(response.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || '유저 정보를 불러오는 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwtToken');
    navigate('/logout');
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);


  return (
    <Box
    sx={{
      display: 'flex',
      height: { xs: 'auto', sm: 'calc(98vh - 57px)' }, // 작은 화면에서는 auto, 큰 화면에서는 calc 사용
      minHeight: 'calc(98vh - 57px)', // 기본 최소 높이 설정
      backgroundColor: '#f5f5f5',
    }}
  >
      {/* Sidebar */}
      <Box
        sx={{
          width: { xs: 60, sm: 240 }, // 작은 화면에서는 축소된 사이드바
          backgroundColor: '#ffffff', // 사이드바 배경색
          color: '#000',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: { xs: 1, sm: 2 }, // 작은 화면에서는 패딩 감소
          transition: 'width 0.3s ease',
        }}
      >
        {/* User Profile */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 1,
            padding: { xs: 1, sm: 2 },
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
          }}
        >
          <Avatar
            sx={{
              width: { xs: 40, sm: 60 }, // 작은 화면에서는 아바타 크기 축소
              height: { xs: 40, sm: 60 },
              bgcolor: theme.palette.primary.main,
              fontSize: { xs: 16, sm: 24 },
            }}
          >
            {userInfo?.nickname?.charAt(0).toUpperCase()}
          </Avatar>
          {window.innerWidth >= 600 && (
            <>
              <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                {userInfo?.nickname || 'Guest'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {userInfo?.name || '게스트'}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                {userInfo?.email || 'example@email.com'}
              </Typography>
            </>
          )}
        </Box>

        {/* Navigation Links */}
        <Box sx={{ flexGrow: 1 }}>
          <List>
            <ListItemButton onClick={() => navigate('/user/profile')}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              {window.innerWidth >= 600 && <ListItemText primary="홈" />}
            </ListItemButton>
            <ListItemButton onClick={() => navigate('/user/profile/category')}>
              <ListItemIcon>
                <CategoryIcon />
              </ListItemIcon>
              {window.innerWidth >= 600 && <ListItemText primary="S3 사용량" />}
            </ListItemButton>
            <ListItemButton onClick={() => navigate('/user/profile/nickname')}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              {window.innerWidth >= 600 && <ListItemText primary="닉네임 관리" />}
            </ListItemButton>
            <ListItemButton onClick={() => navigate('/logout')}>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              {window.innerWidth >= 600 && <ListItemText primary="Settings" />}
            </ListItemButton>
          </List>
        </Box>

        {/* Logout Button */}
        <List>
          <ListItemButton onClick={() => navigate('/logout')}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            {window.innerWidth >= 600 && <ListItemText primary="Logout" />}
          </ListItemButton>
        </List>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          padding: 4,
          backgroundColor: '#ffffff', // 메인 콘텐츠 영역 배경색
          overflow: 'auto',
        }}
      >
        {children}
      </Box>
    </Box>
  );

};

export default Layout;
