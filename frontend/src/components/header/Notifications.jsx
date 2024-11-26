import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Badge, IconButton, Menu, CircularProgress, Typography, List, ListItem, ListItemText, Tooltip } from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DoneAllIcon from "@mui/icons-material/Done";
import TurnedInIcon from "@mui/icons-material/TurnedIn";
import NotificationItem from "./NotificationItem.jsx";
import useWebSocket from "../../hooks/useNotiWebSocket.js";
import useFetchNotifications from "../../hooks/useFetchNotifications.js";
import { markNotificationsAsRead, markNotificationAsSave, releaseSaveNotification } from "../../hooks/notificationAPI.js";
import useInfiniteScroll from "../../hooks/useInfiniteScroll.js";

const Notifications = ({ userId, theme }) => {
    const notificationMenuRef = useRef(null);
    const [showArchived, setShowArchived] = useState(false);
    const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
    const { notifications, lastEvaluatedKey, isFetching, fetchNotification, setNotifications } = useFetchNotifications(userId);

    const [unReadCount, setUnReadCount] = useState(0);

    useWebSocket(userId, (message) => {
        if (message.unReadCount) {
            setUnReadCount(message.unReadCount);
        }

        if (message.studyNotification) {
            setUnReadCount((prevCount) => prevCount + 1);
            setNotifications((prev) => [message.studyNotification, ...prev]);
        }
    });

    const handleNotificationsClick = async (event) => {
        setNotificationsAnchorEl(event.currentTarget);
        setShowArchived(false);
        await fetchNotification();
    };

    useInfiniteScroll(notificationMenuRef, fetchNotification, isFetching, lastEvaluatedKey);

    const handleMarkAllAsRead = async () => {
        const notificationIds = notifications
            .filter((notification) => notification.isRead === "0")
            .map((notification) => notification.id);

        if (notificationIds.length > 0) {
            try {
                const response = await markNotificationsAsRead(userId, notificationIds);
                if (response.status === 200) {
                    setNotifications((prev) =>
                        prev.map((notification) =>
                            notification.isRead === "1"
                                ? notification
                                : { ...notification, isRead: "1" }
                        )
                    );
                    setUnReadCount((prevCount) => Math.max(prevCount - notificationIds.length, 0));
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
            const updatedNotification = await markNotificationAsSave(userId, id);
            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === updatedNotification.id
                        ? { ...notification, isSave: updatedNotification.isSave, isRead: updatedNotification.isRead }
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
            const updatedNotification = await releaseSaveNotification(userId, id);
            setNotifications((prev) =>
                prev.map((notification) =>
                    notification.id === updatedNotification.id
                        ? { ...notification, isSave: "0" }
                        : notification
                )
            );
        } catch (error) {
            console.error("Error releasing notification save:", error);
            alert("알림 저장 해제에 실패했습니다.");
        }
    };

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
                onClose={() => setNotificationsAnchorEl(null)}
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
                                    padding: theme.spacing(1, 2),
                                    borderBottom: `1px solid ${theme.palette.divider}`,
                                }}
                            >
                                <Typography variant="h6" component="span" sx={{ fontWeight: "bold" }}>
                                    알림
                                </Typography>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                    <Tooltip title={showArchived ? "알림 나가기" : "보관함 보기"} placement="top">
                                        <IconButton size="small" onClick={() => setShowArchived(!showArchived)} sx={{ color: theme.palette.primary.main }}>
                                            {showArchived ? <ArrowBackIcon /> : <TurnedInIcon />}
                                        </IconButton>
                                    </Tooltip>
                                    {!showArchived && (
                                        <Tooltip title="전체 읽음처리" placement="top">
                                            <IconButton size="small" onClick={handleMarkAllAsRead} sx={{ color: theme.palette.primary.main }}>
                                                <DoneAllIcon />
                                            </IconButton>
                                        </Tooltip>
                                    )}
                                </Box>
                            </Box>
                            {notifications.length > 0 ? (
                                notifications.map((notification) => (
                                    <NotificationItem
                                        key={notification.id}
                                        notification={notification}
                                        theme={theme}
                                        handleMarkAsSave={handleMarkAsSave}
                                        handleReleaseSave={handleReleaseSave}
                                    />
                                ))
                            ) : (
                                <ListItem>
                                    <ListItemText primary="알림이 없습니다." />
                                </ListItem>
                            )}
                            {isFetching && notifications.length > 0 && (
                                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", padding: theme.spacing(2) }}>
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

export default Notifications;
