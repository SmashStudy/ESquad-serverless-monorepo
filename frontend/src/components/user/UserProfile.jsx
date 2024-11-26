import CategoryIcon from "@mui/icons-material/Category";
import DashboardIcon from "@mui/icons-material/Dashboard";
import HomeIcon from "@mui/icons-material/Home";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import {
  Avatar,
  Box,
  Button,
  Card,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "https://api.esquad.click/local/users/get-user-info";

const UserProfile = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("jwtToken"); // JWT 토큰 가져오기

      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }

      const response = await axios.get(API_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUserInfo(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "유저 정보를 불러오는 중 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    navigate("/login");
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          flexDirection: "column",
        }}
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.reload()}
        >
          다시 시도
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        height: "calc(98vh - 55px)",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          width: 240,
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 2,
        }}
      >
        <List>
          <ListItem button onClick={() => navigate("/user/profile")}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>
          <ListItem button onClick={() => navigate("/dashboard")}>
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItem>
          <ListItem button onClick={() => navigate("/user/profile/category")}>
            <ListItemIcon>
              <CategoryIcon />
            </ListItemIcon>
            <ListItemText primary="Category" />
          </ListItem>
          <ListItem button onClick={() => navigate("/user/profile/nickname")}>
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
      <Box
        sx={{
          flexGrow: 1,
          padding: 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
        }}
      >
        {/* Profile Picture */}
        <Card
          sx={{ width: "100%", maxWidth: 600, textAlign: "center", padding: 2 }}
        >
          <Avatar
            sx={{
              width: 90,
              height: 90,
              margin: "0 auto 18px auto",
              backgroundColor: "#1976d2",
            }}
          >
            {userInfo?.nickname?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="h5" sx={{ fontWeight: "bold" }}>
            {userInfo?.name || "User"}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {userInfo?.email || "No email provided"}
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ marginTop: 1 }}
          >
            가입일: {new Date(userInfo?.createdAt).toLocaleDateString()}
          </Typography>
        </Card>

        {/* Nickname */}
        <Card sx={{ width: "100%", maxWidth: 600, padding: 2 }}>
          <Typography variant="h6">닉네임</Typography>
          <Typography variant="h6" color="primary">
            {userInfo?.nickname || "N/A"}
          </Typography>
        </Card>

        {/* Additional Info */}
        <Card sx={{ width: "100%", maxWidth: 600, padding: 2 }}>
          <Typography variant="h6">활동중인 스터디</Typography>
          <Typography variant="body1" color="textSecondary">
            뭘가요?
          </Typography>
        </Card>
      </Box>
    </Box>
  );
};

export default UserProfile;
