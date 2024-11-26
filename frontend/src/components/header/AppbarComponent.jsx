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
import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
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

const formatTimeAgo = (isoDate) => {
  const now = new Date();
  const createdAt = new Date(isoDate);
  const diffInSeconds = Math.floor((now - createdAt) / 1000);

  const minutes = Math.floor(diffInSeconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) {
    return "지금 막";
  } else if (minutes < 60) {
    return `${minutes} 분 전`;
  } else if (hours < 24) {
    return `${hours} 시간 전`;
  } else {
    return `${days} 일 전`;
  }
};

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

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    alert("로그아웃 되었습니다. 다음에 또 만나요!");
    navigate("/login");
  };

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
  const [notifications, setNotifications] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const notificationMenuRef = useRef(null);
  const socketRef = useRef(null); // 동일한 서버에 대한 다중 WebSocket 연결 방지
  const [loading, setLoading] = useState(true);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null);
  const [unReadCount, setUnReadCount] = useState(0);
  const [isFetching, setIsFetching] = useState(false);

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("md"));
  const isVerySmallScreen = useMediaQuery("(max-width: 30vw)");

  const teamTabOpen = Boolean(teamAnchorEl);
  const [isTeamCreationModalOpen, setIsTeamCreationModalOpen] = useState(false);

  // WebSocket 연결이 열려 있다면 닫고 초기화
  if (socketRef.current) {
    console.log("Closing WebSocket connection.");
    socketRef.current.close();
    socketRef.current = null;
  }

  const connectToWebSocket = (retryCount = 0) => {
    const MAX_RETRIES = 5; // Maximum number of retries
    const BASE_DELAY = 1000; // Base delay in milliseconds

    // Prevent reconnect attempts beyond MAX_RETRIES
    if (retryCount > MAX_RETRIES) {
      console.error(
        "Maximum reconnection attempts reached. Stopping reconnection."
      );
      return;
    }

    if (
      socketRef.current &&
      (socketRef.current.readyState === WebSocket.OPEN ||
        socketRef.current.readyState === WebSocket.CONNECTING)
    ) {
      console.log("WebSocket is already active. Skipping new connection.");
      return;
    }

    // WebSocket server address (including userId in the query parameter)
    const address = `wss://ws.api.esquad.click?userId=${encodeURIComponent(
      userId
    )}`;
    const ws = new WebSocket(address);
    console.log("Creating a new WebSocket connection.");

    // When WebSocket connection is successfully established
    ws.onopen = () => {
      console.log("WebSocket connection established.");

      // Send message to request unread notifications count
      const fetchNotificationsMessage = JSON.stringify({
        action: "countUnReadNotifications", // Define action type
        userId: userId, // Include user ID
      });
      ws.send(fetchNotificationsMessage);
    };

    // When a message is received via WebSocket
    ws.onmessage = (message) => {
      const obj = JSON.parse(message.data); // Parse message data as JSON
      console.log(`Received message from WebSocket: ${JSON.stringify(obj)}`);
      onMessageReceived(obj); // Handle received message
    };

    // When WebSocket connection is closed
    ws.onclose = (event) => {
      console.log(
        "WebSocket connection closed. Attempting to reconnect...",
        event
      );

      // Retry connection with exponential backoff
      const delay = BASE_DELAY * Math.pow(2, retryCount);
      console.log(`Retrying connection in ${delay}ms...`);
      setTimeout(() => connectToWebSocket(retryCount + 1), delay);

      socketRef.current = null; // Reset socket reference
    };

    // When a WebSocket error occurs
    ws.onerror = (event) => {
      console.error("WebSocket error occurred:", event);

      // Retry connection with exponential backoff
      const delay = BASE_DELAY * Math.pow(2, retryCount);
      console.log(`Retrying connection in ${delay}ms due to error...`);
      setTimeout(() => connectToWebSocket(retryCount + 1), delay);

      socketRef.current = null; // Reset socket reference
    };

    socketRef.current = ws;
  };

  // WebSocket에서 받은 메시지를 처리하는 함수
  const onMessageReceived = (message) => {
    if (message.unReadCount) {
      setUnReadCount(message.unReadCount);
    }

    if (message.studyNotification) {
      // studyNotification을 기존 알림 목록의 맨 앞에 추가하여 상태를 업데이트
      setUnReadCount((prevCount) => prevCount + 1);
      setNotifications((prev) => [message.studyNotification, ...prev]);
    }
  };

  const handleScroll = async () => {
    if (notificationMenuRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        notificationMenuRef.current;

      // Trigger load more when scrolled within 100 pixels of the bottom
      if (
        scrollHeight - scrollTop - clientHeight <= 100 &&
        !isFetching &&
        lastEvaluatedKey
      ) {
        setIsFetching(true); // Set fetching state
        try {
          await fetchNotification(lastEvaluatedKey); // Fetch with the current pagination key
        } finally {
          setIsFetching(false); // Reset fetching state
        }
      }
    }
  };

  // Debounce the scroll handler
  const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
      if (timeout) clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), delay);
    };
  };

  // 컴포넌트가 마운트될 때 채팅 메시지를 가져오는 함수
  useEffect(() => {
    if (!socketRef.current) {
      connectToWebSocket(); // WebSocket 연결 시작
    }

    // 컴포넌트가 언마운트될 때 WebSocket 정리
    // return () => closeWebSocket();
  }, []);

  // Handle team menu open/close
  const handleTeamMenuClick = (event) => {
    setTeamAnchorEl(event.currentTarget);
  };
  const handleTeamMenuClose = () => {
    setTeamAnchorEl(null);
  };

  // Handle notifications menu open/close
  const handleNotificationsClick = async (event) => {
    setNotificationsAnchorEl(event.currentTarget); // Open the notifications menu
    setShowArchived(false);
    setIsFetching(true); // Start fetching notifications
    setNotifications([]); // Clear existing notifications to ensure fresh data is shown
    setLastEvaluatedKey(null); // Reset pagination for a fresh fetch

    try {
      await fetchNotification(); // Fetch fresh notifications directly
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsFetching(false); // Ensure loading state is reset
    }
  };

  const fetchNotification = async (key = null) => {
    if (isFetching) return; // Prevent duplicate fetches

    setIsFetching(true); // Set fetching to true
    try {
      const endpoint = showArchived
        ? `https://api.esquad.click/notification/filter-saved`
        : `https://api.esquad.click/notification/all`;

      const response = await axios.post(
        endpoint,
        {
          userId: userId,
          lastEvaluatedKey: key, // Include pagination key if exists
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(`Fetched notifications: ${JSON.stringify(response.data)}`);

      setNotifications((prev) => [
        ...(prev || []),
        ...(response.data.items || []),
      ]);
      setLastEvaluatedKey(response.data.lastEvaluatedKey || null);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  };

  useEffect(() => {
    if (notificationsAnchorEl) {
      const notificationMenuElement = notificationMenuRef.current;

      if (notificationMenuElement) {
        const debouncedScrollHandler = debounce(handleScroll, 300); // Adjust debounce time as needed
        notificationMenuElement.addEventListener(
          "scroll",
          debouncedScrollHandler
        );

        return () => {
          notificationMenuElement.removeEventListener(
            "scroll",
            debouncedScrollHandler
          );
        };
      }
    }
  }, [notificationsAnchorEl, lastEvaluatedKey, isFetching]);

  const handleMarkAllAsRead = async () => {
    const notificationIds = notifications
      .filter((notification) => notification.isRead === "0") // isRead가 '0'인 알림만 필터링
      .map((notification) => notification.id); // 필터링된 알림에서 id만 추출

    if (notificationIds.length > 0) {
      try {
        // REST API로 읽음 처리 요청
        const response = await axios.post(
          `https://api.esquad.click/notification/mark`,
          {
            notificationIds,
            userId,
          },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (response.status === 200) {
          // 클라이언트 상태에서도 모든 알림을 읽음 처리
          setNotifications((prev) =>
            prev.map(
              (notification) =>
                notification.isRead === "1"
                  ? notification // 이미 읽은 알림은 그대로 유지
                  : { ...notification, isRead: "1" } // 새로 읽음 처리
            )
          );

          // Decrease the unReadCount by the number of processed notifications
          setUnReadCount((prevCount) =>
            Math.max(prevCount - notificationIds.length, 0)
          );
        }
      } catch (error) {
        console.error("Error marking notifications as read:", error);
        alert("알림 읽음 처리에 실패했습니다.");
      }
    } else {
      alert("모든 알림이 이미 읽음처리되었습니다");
    }
  };

  const handleMarkAsSave = async (id) => {
    try {
      const url = `https://api.esquad.click/notification/save`;
      const queryParams = `?userId=${encodeURIComponent(
        userId
      )}&id=${encodeURIComponent(id)}`;
      const fullUrl = `${url}${queryParams}`;

      // Make the GET request using axios
      const response = await axios.get(fullUrl, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      // 서버에서 반환된 업데이트된 알림 객체를 가져옴
      const updatedNotification = response.data;

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
      console.error("Error marking notifications as read:", error);
      alert("알림 처리에 실패했습니다.");
    }
  };

  const handleReleaseSave = async (id) => {
    try {
      const url = `https://api.esquad.click/notification/release-save`;
      const queryParams = `?userId=${encodeURIComponent(
        userId
      )}&id=${encodeURIComponent(id)}`;
      const fullUrl = `${url}${queryParams}`;

      // Make the GET request using axios
      const response = await axios.get(fullUrl, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        const updatedNotification = response.data;
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === updatedNotification.id
              ? { ...notification, isSave: "0" }
              : notification
          )
        );
      }
    } catch (error) {
      console.error("Error releasing notification save:", error);
      alert("알림 저장 해제에 실패했습니다.");
    }
  };

  const handleToggleArchived = async () => {
    if (showArchived) {
      // If currently in archive mode, exit and refresh notifications
      setShowArchived(false); // Exit archive mode
      setLastEvaluatedKey(null); // Reset pagination
      await handleNotificationsClick(); // Fetch fresh notifications
    } else {
      // Enter archive mode
      setShowArchived(true); // Enable archive mode
      setNotifications([]); // Clear current notifications
      setLastEvaluatedKey(null); // Reset pagination
      setIsFetching(true); // Set loading state

      try {
        await fetchSavedNotifications(); // Fetch archived notifications
      } finally {
        setIsFetching(false); // Reset loading state
      }
    }
  };

  const fetchSavedNotifications = async (key = null) => {
    try {
      const response = await axios.post(
        `https://api.esquad.click/notification/filter-saved`,
        {
          userId: userId,
          ...(key && { lastEvaluatedKey: key }),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log(`Fetched notifications: ${JSON.stringify(response.data)}`);

      // Update notifications state
      setNotifications((prev) => {
        return prev ? [...prev, ...response.data.items] : response.data.items;
      });

      // Update lastEvaluatedKey
      setLastEvaluatedKey(response.data.lastEvaluatedKey || null);
    } catch (err) {
      console.error(err);
    }
  };

  const visibleNotifications = showArchived
    ? notifications.filter((notification) => notification.isSave === "1") // Show only saved notifications
    : notifications;

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
                  <ListItem
                    button
                    onClick={handleCreateTeamButtonClick}
                    sx={{
                      "&:hover": { cursor: "pointer", fontSize: "1.4rem" },
                    }}
                  >
                    <ListItemText primary="새로운 팀 생성" />
                  </ListItem>

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
                          <ListItem
                            button
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
                          </ListItem>
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
                  <Avatar alt="User Avatar" src="/src/assets/user-avatar.png" />
                  {/*<Typography variant="body1">{userInfo ? userInfo.nickname : "유저 이름"}</Typography>*/}
                  <Typography variant="body1">{userName}</Typography>
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
                  {isFetching && notifications.length === 0 ? (
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
                              onClick={handleToggleArchived}
                              sx={{
                                color: `${theme.palette.primary.main}`,
                              }}
                            >
                              {showArchived ? (
                                <ArrowBackIcon
                                  onClick={handleNotificationsClose}
                                />
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
                      {visibleNotifications.length > 0 ? (
                        <>
                          {visibleNotifications.map((notification) => (
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
