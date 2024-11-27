import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DoneAllIcon from "@mui/icons-material/Done";
import NotificationsIcon from "@mui/icons-material/Notifications";
import TurnedInIcon from "@mui/icons-material/TurnedIn";
import TurnedInNotIcon from "@mui/icons-material/TurnedInNot";
import {
  Avatar,
  Badge,
  Box,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Menu,
  Tooltip,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/system";
import React, { useEffect, useRef, useState } from "react";

const NotificationsMenu = ({
  theme,
  user,
  fetchAll,
  fetchAllSaved,
  markAllAsRead,
  markAsSave,
  releaseSaved,
  formatTimeAgo,
}) => {
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [lastEvaluatedKey, setLastEvaluatedKey] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [unReadCount, setUnReadCount] = useState(0);
  const notificationMenuRef = useRef(null);

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

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
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

  return (
    <>
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
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {showArchived ? "보관된 알림" : "알림"}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
                      {showArchived ? <ArrowBackIcon /> : <TurnedInIcon />}
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
                                notification.isRead === "0" ? "bold" : "normal",
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
    </>
  );
};

export default NotificationsMenu;
