import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ChatIcon from "@mui/icons-material/Chat";
import DoneAllIcon from "@mui/icons-material/Done";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SearchIcon from "@mui/icons-material/Search";
import TurnedInIcon from "@mui/icons-material/TurnedIn";
import TurnedInNotIcon from "@mui/icons-material/TurnedInNot";
import {
  alpha,
  AppBar,
  Avatar,
  Badge,
  Box,
  Button,
  CircularProgress,
  Divider,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  styled,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  fetchAll,
  fetchAllSaved,
  markAllAsRead,
  markAsSave,
  releaseSaved,
} from "../../hooks/notificationAPI.js";
import useNotiWebSocket from "../../hooks/useNotiWebSocket.js";
import formatTimeAgo from "../../utils/formatTimeAgo.js";
import TeamCreationDialog from "../team/TeamCreationDialog.jsx";

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
  updateTeams,
  teams,
  toggleChatDrawer,
}) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [showSearchBar, setShowSearchBar] = useState(null);
  const [teamAnchorEl, setTeamAnchorEl] = useState(null);
  const [accountAnchorEl, setAccountAnchorEl] = useState(null);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const notificationMenuRef = useRef(null);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null);
  const [unReadCount, setUnReadCount] = useState(0);
  const [isFetching, setIsFetching] = useState("false");
  const [user, setUser] = useState({
    name: "없슴",
    email: "yesie0108@gmail.com",
    nickname: "yejiii",
  });

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const isVerySmallScreen = useMediaQuery("(max-width: 30vw)");

  const teamTabOpen = Boolean(teamAnchorEl);
  const [isTeamCreationModalOpen, setIsTeamCreationModalOpen] = useState(false);
  const [error, setError] = useState("");

  // const fetchNickname = async () => {
  //   try {
  //     const response = await axios.get(
  //       "https://api.esquad.click/local/users/get-nickname",
  //       {
  //         headers: {
  //           Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
  //         },
  //       }
  //     );
  //     setUser({
  //       nickname: response.data.nickname,
  //       ...user,
  //     });
  //   } catch (err) {
  //     console.error("닉네임 가져오기 오류:", err);
  //     setError("닉네임을 가져오는 중 오류가 발생했습니다.");
  //   }
  // };

  // useEffect(() => {
  //   const fetchToken = async () => {
  //     await delay(100); // 딜레이 안 달아두면 localstorage에 jwtToken 적재 되기도전에 useEffect 돌아가서 token null 뜸
  //     const token = localStorage.getItem("jwtToken");
  //     if (token) {
  //       const decodedToken = decodeJWT(token);
  //       if (decodedToken) {
  //         setUser({
  //           username: decodedToken.name || "Name",
  //           userId: decodedToken.email,
  //           nickname: decodedToken.nickname,
  //         });
  //       }
  //     }
  //   };
  //   fetchToken();
  // }, []);

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    alert("로그아웃 되었습니다. 다음에 또 만나요!");
    navigate("/google");
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

  // 알림 메뉴에서 스크롤 처리(for 페이징)
  const handleScroll = async () => {
    if (notificationMenuRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        notificationMenuRef.current;

      // 사용자가 아래로 스크롤하면 추가 알림을 로드
      if (
        scrollHeight - scrollTop - clientHeight <= 100 &&
        !isFetching &&
        lastEvaluatedKey
      ) {
        if (showArchived) await fetchSavedNotifications(lastEvaluatedKey);
        else await handleFetchNotifications(lastEvaluatedKey);
      }
    }
  };

  // 스크롤 이벤트를 디바운싱 처리
  // 함수의 호출이 완전히 멈춘 뒤 일정 시간이 지난 뒤에 실행시키는 방법 : 스크롤이 완전히 멈춘 후에야 실행
  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  // Handle team menu open/close
  const handleTeamMenuClick = (event) => {
    setTeamAnchorEl(event.currentTarget);
  };
  const handleTeamMenuClose = () => {
    setTeamAnchorEl(null);
  };

  // 알림 메뉴를 열고 알림 데이터를 새로 가져오는 과정 처리
  const handleNotificationsClick = async (event) => {
    setNotificationsAnchorEl(() => event.currentTarget); // Open notification menu
    setShowArchived(() => false); // Reset showArchived state
    setNotifications(() => []); // Clear notifications
    setLastEvaluatedKey(() => null); // Reset pagination keys

    // React's state updates are asynchronous, so functional updates ensure the most recent state is used
    try {
      setIsFetching(() => true); // Set loading state
      await handleFetchNotifications(); // Fetch notifications
    } finally {
      setIsFetching(() => false); // Reset loading state
    }
  };

  // 보관된 알림 보기
  const handleToggleArchived = async () => {
    setShowArchived(() => true); // 보관함 모드 활성화
    setNotifications(() => []); // 현재 알림 초기화
    setLastEvaluatedKey(() => null); // 페이지네이션 키 초기화
    setIsFetching(() => true); // 로드 상태 설정

    if (isFetching) return;

    try {
      setIsFetching(() => true); // Set loading state
      await fetchSavedNotifications();
    } finally {
      setIsFetching(() => false); // Reset loading state
    }
  };

  const handleFetchNotifications = async (key = null) => {
    try {
      const result = await fetchAll({
        lastEvaluatedKey: key,
        user,
      });

      // 응답 데이터를 기반으로 상태 업데이트
      setNotifications((prev) => [...(prev || []), ...(result.items || [])]);

      // Update the last evaluated key for pagination
      setLastEvaluatedKey(result.lastEvaluatedKey || null);
    } catch (error) {
      alert(error);
    }
  };

  const fetchSavedNotifications = async (key = null) => {
    try {
      const result = await fetchAllSaved({
        user,
        key,
      });

      console.log(JSON.stringify(result));
      setNotifications((prev) => {
        return prev ? [...prev, ...result.items] : result.items;
      });

      setLastEvaluatedKey(result.lastEvaluatedKey || null);
    } catch (error) {
      alert(error);
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead({ notifications, user, setNotifications, setUnReadCount });
  };

  const handleMarkAsSave = async (notificationId) => {
    try {
      const updatedNotification = await markAsSave({
        user,
        notificationId,
        setNotifications,
        setUnReadCount,
      });

      // 기존 알림 상태 업데이트
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === updatedNotification.id
            ? {
                ...notification,
                isSave: updatedNotification.isSave,
                isRead: updatedNotification.isRead,
              }
            : notification
        )
      );
      setUnReadCount((prevCount) => Math.max(prevCount - 1, 0));
    } catch (error) {
      alert(error);
    }
  };

  const handleReleaseSave = async (notificationId) => {
    try {
      const updatedNotification = await releaseSaved({
        user,
        notificationId,
        setNotifications,
      });

      setNotifications((prev) =>
        prev.filter(
          (notification) => notification.id !== updatedNotification.id
        )
      );
    } catch (error) {
      alert(error);
    }
  };

  useEffect(() => {
    // 알림 메뉴가 열려 있는 경우
    if (notificationsAnchorEl) {
      // 알림 메뉴의 DOM 요소를 참조
      const notificationMenuElement = notificationMenuRef.current;

      // DOM 요소가 존재하는 경우
      if (notificationMenuElement) {
        // 스크롤 이벤트 핸들러를 디바운싱 처리 (300ms 지연 적용)
        const debouncedScrollHandler = debounce(handleScroll, 300); // 필요한 경우 디바운스 시간 조정 가능

        // 스크롤 이벤트 리스너 추가
        notificationMenuElement.addEventListener(
          "scroll", // 스크롤 이벤트
          debouncedScrollHandler // 디바운싱된 핸들러
        );

        // 컴포넌트 언마운트 또는 상태 변경 시 정리 작업 수행
        return () => {
          notificationMenuElement.removeEventListener(
            "scroll", // 스크롤 이벤트
            debouncedScrollHandler // 이전에 등록된 디바운싱 핸들러 제거
          );
        };
      }
    }
    // 의존성 배열: notificationsAnchorEl, lastEvaluatedKey, isFetching가 변경될 때만 이 useEffect 실행
  }, [notificationsAnchorEl, lastEvaluatedKey, isFetching]);

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
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
                  />

                  {teams == null ? (
                    <ListItem>
                      <ListItemText primary="팀이 없습니다." />
                    </ListItem>
                  ) : (
                    <>
                      {teams.map((team, index) => (
                        <Link
                          to={`/teams/${team.id}`}
                          className={`menu-team${index}`}
                          key={index}
                        >
                          <ListItemButton
                            onClick={() => updateSelectedTeam(index)}
                            sx={{
                              "&:hover": {
                                cursor: "pointer",
                                fontSize: "1.4rem",
                              },
                            }}
                          >
                            <ListItemIcon>
                              <Avatar
                                alt="Team Avatar"
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
                    {user?.nickname}
                  </Avatar>
                  {/*<Typography variant="body1">{userInfo ? userInfo.nickname : "유저 이름"}</Typography>*/}
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

              {/* Notification Button */}
              <IconButton color="inherit" onClick={handleNotificationsClick}>
                <Badge badgeContent={unReadCount} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>

              <Menu
                anchorEl={notificationsAnchorEl}
                open={Boolean(notificationsAnchorEl)}
                onClose={handleNotificationsClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                <Box
                  ref={notificationMenuRef}
                  sx={{
                    position: "relative",
                    width: 360,
                    height: 500,
                    overflowY: "auto",
                  }}
                >
                  {/* 데이터를 로드 중일 때 스피너 표시 */}
                  {isFetching && notifications.length == 0 ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100%",
                      }}
                    >
                      <CircularProgress color="primary" size="30px" />
                    </Box>
                  ) : (
                    <List sx={{ width: "100%", paddingBottom: 6 }}>
                      {/* 알림 헤더 */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: theme.spacing(1, 2), // Add spacing for alignment
                          borderBottom: `1px solid ${alpha(
                            theme.palette.common.black,
                            0.1
                          )}`, // Optional border for separation
                        }}
                      >
                        <Typography
                          variant="h6"
                          component="span"
                          sx={{ fontWeight: "bold" }}
                        >
                          알림
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <Tooltip
                            title={showArchived ? "알림 나가기" : "보관함 보기"}
                            placement="top"
                          >
                            <IconButton
                              size="small"
                              onClick={
                                showArchived
                                  ? handleNotificationsClose
                                  : handleToggleArchived
                              }
                              sx={{
                                color: theme.palette.primary.main,
                              }}
                            >
                              {showArchived ? (
                                <ArrowBackIcon />
                              ) : (
                                <TurnedInIcon />
                              )}
                            </IconButton>
                          </Tooltip>
                          {!showArchived && (
                            <Tooltip title="전체 읽음처리" placement="top">
                              <IconButton
                                size="small"
                                onClick={handleMarkAllAsRead}
                                sx={{
                                  color: `${theme.palette.primary.main}`,
                                }}
                              >
                                <DoneAllIcon />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </Box>

                      {/* 알림 목록 */}
                      {notifications.length > 0 ? (
                        <>
                          {notifications.map((notification) => (
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
                                {notification.isRead === "0" ? (
                                  <Badge
                                    color="error"
                                    variant="dot"
                                    anchorOrigin={{
                                      vertical: "top",
                                      horizontal: "left",
                                    }}
                                    overlap="circular"
                                  >
                                    <Avatar src="/static/images/avatar/1.jpg" />
                                  </Badge>
                                ) : (
                                  <Avatar src="/static/images/avatar/1.jpg" />
                                )}
                              </ListItemAvatar>
                              <ListItemText
                                primary={
                                  <Typography
                                    component="span"
                                    variant="body1"
                                    sx={{
                                      color:
                                        notification.isRead === "0"
                                          ? "text.primary"
                                          : "text.secondary",
                                      fontWeight:
                                        notification.isRead === "0"
                                          ? "bold"
                                          : "normal",
                                    }}
                                  >
                                    {notification.sender}
                                  </Typography>
                                }
                                secondary={
                                  <React.Fragment>
                                    <Typography
                                      component="span"
                                      variant="body2"
                                      sx={{
                                        color:
                                          notification.isRead === "0"
                                            ? "text.primary"
                                            : "text.secondary",
                                        display: "block",
                                        marginTop: "4px",
                                      }}
                                    >
                                      {notification.message}
                                    </Typography>
                                    <Typography
                                      component="span"
                                      variant="caption"
                                      sx={{
                                        color:
                                          notification.isRead === "0"
                                            ? "text.secondary"
                                            : "text.disabled",
                                        display: "block",
                                        marginTop: "4px",
                                      }}
                                    >
                                      {formatTimeAgo(notification.createdAt)}
                                    </Typography>
                                  </React.Fragment>
                                }
                              />

                              {/* Archive or Saved Icon */}
                              <Tooltip title="보관하기" placement="bottom">
                                <IconButton
                                  edge="end"
                                  onClick={() =>
                                    notification.isSave !== "1"
                                      ? handleMarkAsSave(notification.id)
                                      : handleReleaseSave(notification.id)
                                  }
                                  sx={{
                                    color: `${theme.palette.primary.main}`,
                                  }}
                                >
                                  {notification.isSave === "1" ? (
                                    <TurnedInIcon sx={{ fontSize: 24 }} />
                                  ) : (
                                    <TurnedInNotIcon sx={{ fontSize: 24 }} />
                                  )}
                                </IconButton>
                              </Tooltip>
                            </ListItem>
                          ))}
                        </>
                      ) : (
                        // No notifications
                        <ListItem>
                          <ListItemText primary="알림이 없습니다." />
                        </ListItem>
                      )}

                      {/* 스크롤 추가 로드 시 스피너 표시 */}
                      {isFetching && notifications.length > 0 && (
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            padding: theme.spacing(2),
                          }}
                        >
                          <CircularProgress color="primary" size="30px" />
                        </Box>
                      )}
                    </List>
                  )}
                </Box>
              </Menu>

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

export default AppBarComponent;
