import React, { useState, useEffect } from "react";
import {
  alpha,
  useTheme,
  styled,
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Button,
  Menu,
  MenuItem,
  Avatar,
  Typography,
  Badge,
  useMediaQuery,
  InputBase,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  ListItemAvatar, ListItemButton,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import NotificationsIcon from "@mui/icons-material/Notifications";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link, NavLink, useNavigate } from "react-router-dom";
import TeamCreationDialog from "../team/TeamCreationDialog.jsx";
import axios from 'axios';

function decodeJWT(token) {
  try {
    const base64Payload = token.split(".")[1];
    const base64 = base64Payload.replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(
      decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join("")
      )
    );
    return payload;
  } catch (error) {
    console.error("Failed to decode JWT token", error);
    return null;
  }
}

const Search = styled("div")(({ theme }) => ({
  position: "relative",
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  "&:hover": {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginLeft: theme.spacing(3),
  marginRight: theme.spacing(3),
  border: `1px solid ${theme.palette.secondary.main}`, // Gold border for the search bar
}));

const SearchIconWrapper = styled("div")(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: "100%",
  position: "absolute",
  pointerEvents: "none",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: "inherit",
  width: "100%",
  "& .MuiInputBase-input": {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create("width"),
    width: "100%",
  },
}));

const AppBarComponent = ({
  handleSidebarToggle,
  handleTab,
  selectedTab,
  updateSelectedTeam,
  changeSelectedTeam,
  updateTeams,
  teams,
  toggleChatDrawer,
}) => {

  const navigate = useNavigate();
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const handleLogout = () => {
    navigate("/logout");
  };

  const fetchNickname = async () => {
    try {
        const response = await axios.get('https://api.esquad.click/dev/users/get-nickname', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
            },
        });
        setNickname(response.data.nickname);
    } catch (err) {
        console.error("닉네임 가져오기 오류:", err);
        setError('닉네임을 가져오는 중 오류가 발생했습니다.');
    }
};

// 컴포넌트 로드 시 닉네임 가져오기
useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token) {
        navigate('/google'); // 토큰이 없으면 로그인 페이지로 이동
    } else {
        fetchNickname();
    }
}, [navigate]);

  const [userName, setUserName] = useState("로딩 중...");

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    const fetchToken = async () => {
      await delay(100); // 딜레이 안 달아두면 localstorage에 jwtToken 적재 되기도전에 useEffect 돌아가서 token null 뜸
      const token = localStorage.getItem("jwtToken");
      if (token) {
        const decodedToken = decodeJWT(token);
        if (decodedToken) {
          setUserName(decodedToken.name || "Name");
        }
      }
    };

    fetchToken();
  }, []);

  const theme = useTheme();
  const [showSearchBar, setShowSearchBar] = useState(null);
  const [teamAnchorEl, setTeamAnchorEl] = useState(null);
  const [accountAnchorEl, setAccountAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Brunch this weekend?",
      content: "I'll be in your neighborhood doing errands this…",
      avatar: "/static/images/avatar/1.jpg",
    },
    {
      id: 2,
      title: "Meeting Reminder",
      content: "Don't forget about the meeting tomorrow at 10 AM.",
      avatar: "/static/images/avatar/2.jpg",
    },
  ]);
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const isVerySmallScreen = useMediaQuery("(max-width: 30vw)");

  const teamTabOpen = Boolean(teamAnchorEl);
  const [isTeamCreationModalOpen, setIsTeamCreationModalOpen] = useState(false);

  // Handle team menu open/close
  const handleTeamMenuClick = (event) => {
    setTeamAnchorEl(event.currentTarget);
  };
  const handleTeamMenuClose = () => {
    setTeamAnchorEl(null);
  };

  // Handle notifications menu open/close
  const handleNotificationsClick = (event) => {
    setNotificationsAnchorEl(event.currentTarget);
  };
  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  // Handle deleting a single notification
  const handleDeleteNotification = (id) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id)
    );
  };

  // Handle deleting all notifications
  const handleDeleteAllNotifications = () => {
    setNotifications([]);
  };

  // Handle account menu open/close
  const handleAccountClick = (event) => {
    setAccountAnchorEl(event.currentTarget);
  };
  const handleAccountClose = () => {
    setAccountAnchorEl(null);
  };

  // 사용자의 팀탭에서 팀 선택
  const handleSelectedTeam = (i) => {
    updateSelectedTeam(i);
  };

  // Handle create team dialog open/close
  const handleCreateTeamButtonClick = () => {
    setIsTeamCreationModalOpen(true);
  };
  const handleCloseCreateTeamModal = () => {
    setIsTeamCreationModalOpen(false);
  };

  return (
    <AppBar
      position="fixed"
      color="inherit"
      elevation={1}
      sx={{ width: `100%`, backgroundColor: "#fff" }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
        <Box sx={{ display: "flex", alignItems: "center", flex: 3 }}>
          {showSearchBar ? (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="back"
              onClick={() => setShowSearchBar(false)}
              sx={{ mr: 2 }}
            >
              <ArrowBackIcon />
            </IconButton>
          ) : (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={handleSidebarToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <NavLink to="/community/questions" activeclassname="nav-logo">
              <img
                src="https://s3-esquad-public.s3.us-east-1.amazonaws.com/esquad-logo-nbk.png"
                alt="Logo"
                style={{ height: "40px", marginRight: "16px" }}
              />
            </NavLink>
          </Box>
          {!showSearchBar && !isVerySmallScreen && (
            <Box sx={{ display: "flex", gap: 1 }}>
              <NavLink
                to="/community/questions"
                activeclassname="nav-community"
              >
                <Button
                  variant="text"
                  size="large"
                  onClick={() => handleTab(0)}
                  sx={{
                    cursor: "pointer",
                    fontSize: isSmallScreen ? "small" : "medium",
                    backgroundColor:
                      selectedTab === 0
                        ? alpha(theme.palette.primary.main, 0.2)
                        : "transparent",
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0.2),
                    },
                  }}
                >
                  커뮤니티
                </Button>
              </NavLink>

              <Button
                id="teamTab-button"
                variant="text"
                size="large"
                onClick={handleTeamMenuClick}
                aria-controls={teamTabOpen ? "team-menu" : undefined}
                aria-haspopup="true"
                aria-expanded={teamTabOpen ? "true" : undefined}
                sx={{
                  cursor: "pointer",
                  fontSize: isSmallScreen ? "small" : "medium",
                  backgroundColor:
                    selectedTab === 1
                      ? alpha(theme.palette.primary.main, 0.2)
                      : "transparent",
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.2),
                  },
                }}
              >
                팀
              </Button>
              <Menu
                id="team-menu"
                anchorEl={teamAnchorEl}
                open={teamTabOpen}
                onClose={handleTeamMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                MenuListProps={{
                  "aria-labelledby": "teamTab-button",
                }}
                sx={{
                  transition: "width 1s ease",
                }}
              >
                <List>
                  <ListItemButton
                    onClick={handleCreateTeamButtonClick}
                    sx={{
                      "&:hover": { cursor: "pointer", fontSize: "1.4rem" },
                    }}
                  >
                    <ListItemText primary="새로운 팀 생성" />
                  </ListItemButton>

                                    {/* Team Creation Modal */}
                                    <TeamCreationDialog
                                        open={isTeamCreationModalOpen}
                                        onClose={handleCloseCreateTeamModal}
                                        updateTeams={updateTeams}
                                        teams={teams}
                                    />

                  {teams == null ? (
                    <ListItem>
                      <ListItemText primary="팀이 없습니다." />
                    </ListItem>
                  ) : (
                    <>
                      {teams.map((team, index) => (
                        <Link
                          to={`/teams/${encodeURIComponent(team.PK)}`}
                          className={`menu-team${index}`}
                          key={index}
                        >
                          <ListItemButton
                            onClick={() => changeSelectedTeam(index)}
                            sx={{
                              "&:hover": {
                                cursor: "pointer",
                                fontSize: "1.4rem",
                              },
                            }}
                          >
                            <ListItemIcon>
                              <Avatar
                                alt={team?.teamName}
                                src="/src/assets/user-avatar.png"
                              />
                            </ListItemIcon>
                            <ListItemText primary={team?.teamName} />
                          </ListItemButton>
                        </Link>
                      ))}
                    </>
                  )}
                </List>
              </Menu>
            </Box>
          )}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", flex: 4 }}>
          {/* 3:4:3 Ratio */}
          {!showSearchBar && (
            <>
              {isSmallScreen ? (
                <IconButton
                  color="inherit"
                  onClick={() => setShowSearchBar(true)}
                >
                  <SearchIcon />
                </IconButton>
              ) : (
                <Search
                  sx={{
                    flexGrow: 1,
                    border: "1px solid",
                    borderColor: (theme) => theme.palette.primary.main,
                    borderRadius: 2,
                  }}
                >
                  <SearchIconWrapper>
                    <SearchIcon />
                  </SearchIconWrapper>
                  <StyledInputBase
                    placeholder="검색"
                    inputProps={{ "aria-label": "search" }}
                  />
                </Search>
              )}
            </>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            flex: 3,
            flexDirection: "row-reverse",
          }}
        >
          {/* 3:4:3 Ratio */}
          {!showSearchBar && (
            <>
              <Box
                sx={{
                  borderRadius: 6,
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.common.black, 0.1),
                  },
                  mx: 2,
                }}
              >
                <IconButton
                  color="inherit"
                  onClick={handleAccountClick}
                  sx={{
                    "&:hover": {
                      backgroundColor: alpha(theme.palette.primary.main, 0),
                    },
                    gap: 1,
                  }}
                >
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    {nickname ? nickname.charAt(0).toUpperCase() : '유'}
                    </Avatar>
                  {/*<Typography variant="body1">{userInfo ? userInfo.nickname : "유저 이름"}</Typography>*/}
                  <Typography variant="body1">{nickname}</Typography>
                </IconButton>
              </Box>
              <Menu
                anchorEl={accountAnchorEl}
                open={Boolean(accountAnchorEl)}
                onClose={handleAccountClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <MenuItem
                  onClick={handleAccountClose}
                  sx={{
                    gap: 1,
                  }}
                >
                  <Avatar />
                  <Link to="/user/profile">
                    <Typography variant="body1">프로필 보기</Typography>
                  </Link>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleAccountClose}>Google 계정</MenuItem>
                <MenuItem onClick={handleLogout}>로그아웃</MenuItem>
                <Divider />
                <MenuItem onClick={handleAccountClose}>설정</MenuItem>
                <MenuItem onClick={handleAccountClose}>고객센터</MenuItem>
                <MenuItem onClick={handleAccountClose}>의견 보내기</MenuItem>
              </Menu>
              <IconButton color="inherit" onClick={handleNotificationsClick}>
                <Badge badgeContent={notifications.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
              {/* chatting sidebar*/}

              <IconButton
                color="inherit"
                onClick={toggleChatDrawer}
                sx={{
                  "&:hover": {
                    color: "#a33ffb",
                  },
                }}
              >
                <ChatIcon fontSize="medium" />
              </IconButton>
              <Menu
                anchorEl={notificationsAnchorEl}
                open={Boolean(notificationsAnchorEl)}
                onClose={handleNotificationsClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                {notifications.length > 0 && (
                  <Box
                    sx={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <Button
                      onClick={handleDeleteAllNotifications}
                      sx={{
                        width: "50%",
                        borderRadius: 0,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.2
                          ),
                        },
                      }}
                    >
                      모든 알림 삭제
                    </Button>
                    <Button
                      onClick={handleNotificationsClose}
                      sx={{
                        width: "50%",
                        borderRadius: 0,
                        backgroundColor: alpha(theme.palette.primary.main, 0.1),
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.2
                          ),
                        },
                      }}
                    >
                      모든 알림 확인
                    </Button>
                  </Box>
                )}
                <List sx={{ width: 360 }}>
                  {notifications.length === 0 ? (
                    <ListItem>
                      <ListItemText primary="알림이 없습니다." />
                    </ListItem>
                  ) : (
                    notifications.map((notification) => (
                      <ListItem
                        key={notification.id}
                        alignItems="flex-start"
                        sx={{
                          "&:hover": {
                            cursor: "pointer",
                            backgroundColor: alpha(
                              theme.palette.common.black,
                              0.1
                            ),
                          },
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar
                            alt={notification.title}
                            src={notification.avatar}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={notification.title}
                          secondary={
                            <React.Fragment>
                              <Typography
                                component="span"
                                variant="body2"
                                sx={{
                                  color: "text.primary",
                                  display: "inline",
                                }}
                              >
                                Ali Connors
                              </Typography>
                              {` — ${notification.content}`}
                            </React.Fragment>
                          }
                        />
                        <IconButton
                          edge="end"
                          onClick={() =>
                            handleDeleteNotification(notification.id)
                          }
                        >
                          <DeleteIcon />
                        </IconButton>
                      </ListItem>
                    ))
                  )}
                </List>
              </Menu>
            </>
          )}
        </Box>

        {showSearchBar && (
          <Search sx={{ flexGrow: 1 }}>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="검색"
              inputProps={{ "aria-label": "search" }}
            />
          </Search>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AppBarComponent;
