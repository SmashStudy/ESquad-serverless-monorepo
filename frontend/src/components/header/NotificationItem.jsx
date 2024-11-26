import React from 'react';
import { Badge, IconButton, Typography, Avatar, ListItem, ListItemText, ListItemAvatar, Tooltip } from "@mui/material";
import TurnedInIcon from "@mui/icons-material/TurnedIn";
import TurnedInNotIcon from "@mui/icons-material/TurnedInNot";

const NotificationItem = ({ notification, theme, handleMarkAsSave, handleReleaseSave }) => {
    return (
        <ListItem
            key={notification.id}
            alignItems="flex-start"
            sx={{
                "&:hover": {
                    cursor: "pointer",
                    backgroundColor: theme.palette.action.hover,
                },
            }}
        >
            <ListItemAvatar>
                {notification.isRead === "0" ? (
                    <Badge
                        color="error"
                        variant="dot"
                        anchorOrigin={{ vertical: "top", horizontal: "left" }}
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
                            color: notification.isRead === "0" ? "text.primary" : "text.secondary",
                            fontWeight: notification.isRead === "0" ? "bold" : "normal",
                        }}
                    >
                        {notification.sender}
                    </Typography>
                }
                secondary={
                    <>
                        <Typography
                            component="span"
                            variant="body2"
                            sx={{
                                color: notification.isRead === "0" ? "text.primary" : "text.secondary",
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
                                color: notification.isRead === "0" ? "text.secondary" : "text.disabled",
                                display: "block",
                                marginTop: "4px",
                            }}
                        >
                            {notification.createdAt}
                        </Typography>
                    </>
                }
            />
            <Tooltip title="보관하기" placement="bottom">
                <IconButton
                    edge="end"
                    onClick={() =>
                        notification.isSave !== "1"
                            ? handleMarkAsSave(notification.id)
                            : handleReleaseSave(notification.id)
                    }
                    sx={{ color: theme.palette.primary.main }}
                >
                    {notification.isSave === "1" ? (
                        <TurnedInIcon sx={{ fontSize: 24 }} />
                    ) : (
                        <TurnedInNotIcon sx={{ fontSize: 24 }} />
                    )}
                </IconButton>
            </Tooltip>
        </ListItem>
    );
};

export default NotificationItem;