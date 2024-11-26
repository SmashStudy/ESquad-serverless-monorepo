import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  Typography,
} from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CategoryIcon from "@mui/icons-material/Category";
import PersonIcon from "@mui/icons-material/Person";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@mui/material/styles";

const Layout = ({ children }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("jwtToken");

      if (!token) {
        throw new Error("로그인이 필요합니다.");
      }

      const response = await axios.get(
        "https://api.esquad.click/local/users/get-user-info",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

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

  return (
    <Box
      sx={{
        display: "flex",
        height: "calc(98vh - 57px)",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Sidebar */}
      <Box
        sx={{
          width: 240,
          backgroundColor: "#fff",
          color: "#000",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 2,
        }}
      >
        {/* User Profile */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 1,
            padding: 2,
            borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
          }}
        >
          <Avatar
            sx={{
              width: 60,
              height: 60,
              bgcolor: theme.palette.primary.main,
              fontSize: 24,
            }}
          >
            {userInfo?.nickname?.charAt(0).toUpperCase()}
          </Avatar>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            {userInfo?.nickname || "Guest"}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {userInfo?.email || "example@email.com"}
          </Typography>
        </Box>

        {/* Navigation Links */}
        <Box sx={{ flexGrow: 1 }}>
          <List>
            <ListItem button onClick={() => navigate("/user/profile")}>
              <ListItemIcon>
                <HomeIcon />
              </ListItemIcon>
              <ListItemText primary="홈" />
            </ListItem>
            <ListItem button onClick={() => navigate("/user/profile/category")}>
              <ListItemIcon>
                <CategoryIcon />
              </ListItemIcon>
              <ListItemText primary="S3 사용량" />
            </ListItem>
            <ListItem button onClick={() => navigate("/user/profile/nickname")}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              <ListItemText primary="닉네임 관리" />
            </ListItem>
            <ListItem button>
              <ListItemIcon>
                <SettingsIcon />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItem>
          </List>
        </Box>

        {/* Logout Button */}
        <List>
          <ListItem button onClick={() => navigate("/logout")}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </Box>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, padding: 4 }}>{children}</Box>
    </Box>
  );
};

export default Layout;
