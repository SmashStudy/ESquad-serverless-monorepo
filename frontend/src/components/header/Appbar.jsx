import axios from "axios";
import React, {useState, useEffect, useCallback} from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChatIcon from "@mui/icons-material/Chat";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import {
  alpha,
  AppBar,
  Avatar,
  Box,
  Button,
  Divider,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
  styled,
  Toolbar,
  useMediaQuery,
  useTheme, CircularProgress,
} from "@mui/material";
import {
  fetchAll,
  fetchAllSaved,
  markAllAsRead,
  markAsSave,
  releaseSaved,
} from "../../hooks/notificationAPI.js";
import useNotiWebSocket from "../../hooks/useNotiWebSocket.js";
import TeamCreationDialog from "../team/TeamCreationDialog.jsx";
import NotificationsMenu from "./NotificationMenu.jsx";
import { getUserApi } from "../../utils/apiConfig.js";
import { decodeJWT } from "../../utils/decodeJWT.js";
import formatTimeAgo from "../../utils/formatTimeAgo.js";
import { useTeams } from "../../context/TeamContext";
import Loading from "../custom/Loading.jsx";

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

const Appbar = ({
  handleSidebarToggle,
  selectedTab, onTabChange,
  toggleChatDrawer, changeSelectedTeam
}) => {
  const theme = useTheme();
  const {teams, updateTeams, loading} = useTeams();
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [teamAnchorEl, setTeamAnchorEl] = useState(null);
  const [showSearchBar, setShowSearchBar] = useState(null);
  const [accountAnchorEl, setAccountAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unReadCount, setUnReadCount] = useState(0);
  const [isUserLoaded, setIsUserLoaded] = useState(false);
  const [role, setRole] = useState(null);

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const isVerySmallScreen = useMediaQuery("(max-width: 30vw)");

  const teamTabOpen = Boolean(teamAnchorEl);
  const [isTeamCreationModalOpen, setIsTeamCreationModalOpen] = useState(false);

  const isHomePage = location.pathname === "/" || location.pathname === '/main';

  useEffect(() => {
    if(isHomePage) {
      onTabChange(-1);
    }
  }, [isHomePage]);

  const fetchUserRole = async () => {
    try {
      const response = await fetch(`${getUserApi()}/role`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("사용자 역할 정보를 가져오지 못했습니다.");
      }

      const data = await response.json();
      setRole(data.role); // 역할 정보 설정
    } catch (error) {
      console.error("사용자 역할 가져오기 중 오류:", error);``
    }
  };

  useEffect(() => {
    const fetchTokenAndData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem("jwtToken");

        if (token) {
          const decodedToken = decodeJWT(token);
          if (decodedToken) {
            setUser({
              username: decodedToken.name || "Name",
              email: decodedToken.email,
            });
            await fetchUserRole(); // 역할 정보 가져오기
          }
        }
      } catch (err) {
        console.error("토큰 처리 오류:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTokenAndData();
  }, []);


  const fetchNickname = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${getUserApi()}/get-nickname`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
        },
      });
      setUser((prev) => ({
        ...prev,
        nickname: response.data.nickname,
      }));
    } catch (err) {
      console.error("닉네임 가져오기 오류:", err);
      setError("닉네임을 가져오는 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 로드 시 닉네임 가져오기
  useEffect(() => {
    const fetchTokenAndData = async () => {
      setIsLoading(true);
      try {
        await delay(100); // JWT 토큰 저장 딜레이
        const token = localStorage.getItem("jwtToken");

        if (token) {
          const decodedToken = decodeJWT(token);
          if (decodedToken) {
            // 사용자 정보를 먼저 업데이트
            setUser({
              username: decodedToken.name || "Name",
              email: decodedToken.email,
            });

            // 닉네임 데이터 가져오기
            await fetchNickname();

            // 모든 데이터가 준비되었음을 표시
            setIsUserLoaded(true);
          }
        }
      } catch (err) {
        console.error("토큰 처리 오류:", err);
        setError("사용자 정보를 처리하는 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTokenAndData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    alert("로그아웃 되었습니다. 다음에 또 만나요!");
    navigate("/login");
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const onMessageReceived = (message) => {
    if (message.unReadCount) {
      setUnReadCount(message.unReadCount);
    }

    if (message.studyNotification) {
      setUnReadCount((prevCount) => prevCount + 1);
      setNotifications((prev) => [message.studyNotification, ...prev]);
    }
  };
  const { connectToWebSocket } = useNotiWebSocket({
    user,
    onMessageReceived,
  });

  useEffect(() => {
    if (isUserLoaded && user?.email) {
      connectToWebSocket();
    }
  }, [isUserLoaded, user]);

  // Handle team menu open/close
  const handleTeamMenuClick = (event) => {
    setTeamAnchorEl(event.currentTarget);
  };
  const handleTeamMenuClose = () => {
    setTeamAnchorEl(null);
  };

  const handleSelectedTeam = (team) => {
    changeSelectedTeam((prev) => team);
    if(selectedTab === 0) onTabChange(1);
  };

  // Handle account menu open/close
  const handleAccountClick = (event) => {
    setAccountAnchorEl(event.currentTarget);
  };
  const handleAccountClose = () => {
    setAccountAnchorEl(null);
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
        <Box sx={{ display: "flex", alignItems: "center", flex: 3}}>
          <Box>
          {showSearchBar ? (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="back"
              onClick={() => setShowSearchBar(false)}
              sx={{ mr: 2, my: 2, }}
            >
              <ArrowBackIcon />
            </IconButton>
          ) : (
              !isHomePage && (
                <IconButton
                  edge="start"
                  color="inherit"
                  aria-label="open drawer"
                  onClick={handleSidebarToggle}
                  sx={{ mr: 2}}
                >
                  <MenuIcon />
                </IconButton>
            )
          )}
          </Box>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <NavLink to="/main" activeclassname="nav-logo">
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
                    onClick={() => onTabChange(0)}
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
                      maxHeight: "40vh",
                      overflowY: "auto",
                }}
              >
                <List>
                  <ListItemButton
                    onClick={() => {
                      handleCreateTeamButtonClick();
                    }}
                    sx={{
                      "&:hover": { cursor: "pointer", fontSize: "1.2rem" },
                    }}
                  >
                    <ListItemText primary="새로운 팀 생성" />
                  </ListItemButton>

                  {/* Team Creation Modal */}
                  <TeamCreationDialog
                      open={isTeamCreationModalOpen}
                      onClose={handleCloseCreateTeamModal}
                      handleTab={onTabChange}
                  />

                  {loading ? ( <CircularProgress color="primary" size="30px" sx={{ ml: 7 }} /> ) :
                    teams.length === 0 ? (
                      <ListItem>
                          <ListItemText primary="팀이 없습니다." />
                      </ListItem>
                    ) : (
                      teams.map((team, index) => (
                        <Link
                          to={`/teams/${encodeURIComponent(team.PK)}/main`}
                          key={team.PK}
                          style={{ textDecoration: "none", color: "inherit" }}
                        >
                          <ListItemButton
                            onClick={() => {
                              handleSelectedTeam(team); // selectedTeam 업데이트
                              handleTeamMenuClose();      // 클릭 이후 Menu 닫기 처리
                            }}
                            sx={{
                              "&:hover": {
                                cursor: "pointer",
                                fontSize: "1.2rem",
                              },
                            }}>
                              <ListItemIcon>
                                <Avatar alt={team?.teamName} src='/src/assets/user-avatar.png' />
                              </ListItemIcon>
                              <ListItemText
                                  primary={team?.teamName.length > 7 ? `${team?.teamName.slice(0, 7)}...` : team?.teamName} // Truncate teamName to 7 characters
                              />
                          </ListItemButton>
                        </Link>
                      ))
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
                    {user?.nickname?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="body1">{user?.nickname}</Typography>
                </IconButton>
              </Box>
              <Menu
                anchorEl={accountAnchorEl}
                open={Boolean(accountAnchorEl)}
                onClose={handleAccountClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                  <Link
                    to="/user/profile"
                    style={{
                      textDecoration: "none", // 밑줄 제거
                      color: "black", // 글자 색을 검정으로 설정
                    }}
                  >
                    <MenuItem onClick={handleAccountClose} sx={{ gap: 1, mb:1 }}>
                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                      {user?.nickname?.charAt(0).toUpperCase()}
                    </Avatar>
                      <Typography variant="body1" sx={{ fontWeight: "bold" }}>
                        프로필 보기
                      </Typography>
                    </MenuItem>
                  </Link>

                {role === "admin" && (

                    <Link to="/admin" style={{
                      textDecoration: "none", // 밑줄 제거
                      color: "black", // 글자 색을 검정으로 설정
                    }}>
                      <Divider sx={{ mb: 1 }}/>
                      <MenuItem onClick={handleAccountClose} sx={{ mb: 1 }}>
                        관리자 페이지
                        </MenuItem>
                      </Link>
                )}
                <Divider sx={{ mb: 1 }}/>
                <MenuItem onClick={handleAccountClose}>Google 계정</MenuItem>
                <MenuItem onClick={handleLogout}>로그아웃</MenuItem>
                <Divider />
                <MenuItem onClick={handleAccountClose}>설정</MenuItem>
                <MenuItem onClick={handleAccountClose}>고객센터</MenuItem>
                <MenuItem onClick={handleAccountClose}>의견 보내기</MenuItem>
              </Menu>
              {/* Notification Button */}
              <NotificationsMenu
                theme={theme}
                user={user}
                fetchAll={fetchAll}
                fetchAllSaved={fetchAllSaved}
                markAllAsRead={markAllAsRead}
                markAsSave={markAsSave}
                releaseSaved={releaseSaved}
                formatTimeAgo={formatTimeAgo}
                unReadCount={unReadCount}
                setUnReadCount={setUnReadCount}
              />
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

export default Appbar;
