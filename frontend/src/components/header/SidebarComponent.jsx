import React, { useState } from "react";
import {
  alpha,
  Avatar,
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { useTheme } from "@mui/material";
import QuizIcon from "@mui/icons-material/Quiz";
import SpaceDashboardIcon from "@mui/icons-material/SpaceDashboard";
import Groups3Icon from "@mui/icons-material/Groups3";
import PeopleIcon from "@mui/icons-material/People";
import AbcIcon from "@mui/icons-material/Abc";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { Link } from "react-router-dom";

const SidebarList = ({ items, drawerOpen, sidebarOpen, selectedSection, onSectionClick }) => {
  const theme = useTheme();

  return (
    <List>
      {items.map((item, index) => {
        const itemId = item.link;

        return (
            <Link
                to={itemId}
                key={itemId}
                style={{textDecoration: "none", color: "inherit"}}
                onClick={() => onSectionClick(itemId)} // 클릭 시 선택 상태 업데이트
            >
              <ListItemButton
                  sx={{
                    display: "flex",
                    flexDirection: drawerOpen
                        ? "row"
                        : sidebarOpen
                            ? "row"
                            : "column",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center",
                    padding: sidebarOpen ? "8px 16px" : "8px 0",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    backgroundColor:
                        selectedSection === itemId
                            ? alpha(theme.palette.primary.main, 0.1) // 선택된 아이템에 theme의 primary 색상 사용
                            : "transparent",
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.1), // hover 시에도 같은 색상
                    },
                  }}
              >
                <ListItemIcon
                    sx={{
                      minWidth: "auto !important",
                      display: "flex",
                      justifyContent: "center",
                      marginBottom: sidebarOpen ? 0 : 1,
                      alignItems: "center",
                    }}
                >
                  {item.icon}
                </ListItemIcon>
                {sidebarOpen && (
                  <ListItemText
                      primary={item.text}
                      sx={{
                        whiteSpace: "wrap",
                        textAlign: "center",
                        transition: "font-size 0.3s ease",
                        fontWeight: selectedSection === itemId ? "bold" : "normal",
                        color: selectedSection === itemId
                            ? theme.palette.primary.main
                            : "inherit",
                      }}
                  />
                )}
              </ListItemButton>
            </Link>
        );
      })}
    </List>
  );
};

const SidebarComponent = ({
  isSmallScreen,
  drawerOpen,
  sidebarOpen,
  handleDrawerClose,
  selectedTab, selectedTeam
}) => {
  const theme = useTheme();
  const [selectedSection, setSelectedSection] = useState(null);

  const communityItems = [
    { text: "질문 및 답변", icon: <QuizIcon />, link: "/community/questions" },
    { text: "자유게시판", icon: <SpaceDashboardIcon />, link: "/community/general" },
    { text: "스터디 모집", icon: <Groups3Icon />, link: "/community/team-recruit" },
  ];

  const studyItems = [
      { text: '스터디', icon: <AbcIcon />, link: `/teams/${encodeURIComponent(selectedTeam?.PK)}/study` },
      { text: '도서 검색', icon: <MenuBookIcon />, link: `/teams/${encodeURIComponent(selectedTeam?.PK)}/book/search` },
      { text: '질문', icon: <QuizIcon />, link: `/teams/${encodeURIComponent(selectedTeam?.PK)}/questions` },
  ];

  const manageItems = [
    { text: '크루', icon: <PeopleIcon  />, link: `teams/${encodeURIComponent(selectedTeam?.PK)}/manage/users` },
    { text: '설정', icon: <SettingsIcon  />, link: `teams/${encodeURIComponent(selectedTeam?.PK)}/manage/settings` },
  ];

  const dangerItems = [
    { text: "나가기", icon: <LogoutIcon />, link: "/logout" },
  ];

  const sidebarContent = (
    <>
      {selectedTab === 0 ? (
        <SidebarList
          items={communityItems}
          drawerOpen={drawerOpen}
          sidebarOpen={sidebarOpen}
          selectedSection={selectedSection}
          onSectionClick={setSelectedSection}
        />
      ) : (
        <Box>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: sidebarOpen ? "flex-start" : "center",
              textAlign: "center",
              py: 2,
              pl: sidebarOpen ? 1 : 0,
              "&:hover": {
                backgroundColor: alpha(theme.palette.background.gray, 0.3),
                cursor: "pointer",
              },
            }}
          >
            <IconButton
              color="inherit"
              sx={{
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.main, 0),
                },
                gap: 3,
              }}
            >
              <Avatar
                alt="Team Profile"
                src="/src/assets/user-avatar.png"
                sx={{
                  transition: "width 0.3s ease",
                  width: 46,
                  height: 46,
                }}
              />
              {sidebarOpen && (
                <Typography variant="text" sx={{ mb: 2, fontWeight: "bolder" }}>
                  {selectedTeam?.teamName}
                </Typography>
              )}
            </IconButton>
          </Box>
          <Divider sx={{ borderBottom: "1px solid #ddd" }} />

          {sidebarOpen && (
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: "bold", mx: 2, mt: 2 }}
            >
              스터디
            </Typography>
          )}
          <SidebarList
            items={studyItems}
            drawerOpen={drawerOpen}
            sidebarOpen={sidebarOpen}
            selectedSection={selectedSection}
            onSectionClick={setSelectedSection}
          />
          <Divider sx={{ borderBottom: "1px solid #ddd" }} />

          {sidebarOpen && (
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: "bold", mx: 2, mt: 2 }}
            >
              관리
            </Typography>
          )}
          <SidebarList
            items={manageItems}
            drawerOpen={drawerOpen}
            sidebarOpen={sidebarOpen}
            selectedSection={selectedSection}
            onSectionClick={setSelectedSection}
          />
          <Divider sx={{ borderBottom: "1px solid #ddd" }} />

          {sidebarOpen && (
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: "bold",
                mx: 2,
                mt: 2,
                color: `${theme.palette.warning.main}`,
              }}
            >
              위험
            </Typography>
          )}
          <SidebarList
            items={dangerItems}
            drawerOpen={drawerOpen}
            sidebarOpen={sidebarOpen}
            selectedSection={selectedSection}
            onSectionClick={setSelectedSection}
          />
        </Box>
      )}
    </>
  );

  return isSmallScreen ? (
    <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerClose}>
      <Box sx={{ width: 240, backgroundColor: "#fff", p: 2 }}>
        {sidebarContent}
      </Box>
    </Drawer>
  ) : (
    !isSmallScreen && (
      <Box
        sx={{
          width: sidebarOpen ? "200px" : "4rem",
          flexShrink: 0,
          backgroundColor: "#fff",
          transition: "width 0.3s ease",
          overflow: "hidden",
          height: "100%",
        }}
      >
        <Box sx={{ width: "100%", height: "100vh", paddingTop: 2 }}>
          {sidebarContent}
        </Box>
      </Box>
    )
  );
};

export default SidebarComponent;
