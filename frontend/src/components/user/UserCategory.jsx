import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import HomeIcon from '@mui/icons-material/Home';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CategoryIcon from '@mui/icons-material/Category';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useNavigate } from 'react-router-dom';

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#8dd1e1'];
const MAX_USAGE = 5 * 1024; // 5GB in MB

const Category = () => {
  const navigate = useNavigate();

  // S3 데이터만 필터링
  const usageData = [
    { name: 'S3', usage: 1200, cost: 15 }, // Usage in MB
  ];

  // S3 데이터 계산
  const s3Usage = usageData[0].usage; // MB
  const remaining = MAX_USAGE - s3Usage;

  // const pieData = usageData.map((item) => ({
  //   name: item.name,
  //   value: item.usage,
  // }));

  const pieData = [
    { name: 'Used', value: s3Usage }, // S3 사용량
    { name: 'Remaining', value: remaining }, // 남은 용량
  ];

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
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 2,
        }}
      >
        <List>
          <ListItem button onClick={() => navigate('/user/profile')}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem button onClick={() => navigate('/dashboard')}>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button onClick={() => navigate('/user/profile/category')}>
            <ListItemIcon>
              <CategoryIcon />
            </ListItemIcon>
            <ListItemText primary="Category" />
          </ListItem>
          <ListItem button onClick={() => navigate('/user/profile/nickname')}>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItem>
          <ListItem button>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        </List>
        <List>
          <ListItem button onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, padding: 5 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ marginBottom: 2 }}>
                  S3 Storage Usage
                </Typography>
                <Box
                  sx={{
                    border: '1px solid #ddd',
                    borderRadius: 2,
                    padding: 1.5,
                    marginBottom: 2,
                  }}
                >
                  <Typography variant="body1">S3</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Used: {(s3Usage / 1024).toFixed(2)} GB
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Remaining: {(remaining / 1024).toFixed(2)} GB
                  </Typography>
                </Box>
                <ResponsiveContainer width="100%" height={500}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={0}
                      outerRadius={200}
                      fill="#8884d8"
                      label
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default Category;
