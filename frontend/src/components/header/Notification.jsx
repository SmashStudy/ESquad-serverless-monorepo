import React from "react";
import {Badge, IconButton} from "@mui/material";
import Menu from '@mui/material/Menu';
import NotificationsIcon from "@mui/icons-material/Notifications";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';

const ITEM_HEIGHT = 75;

const Notification = ({notification = [] }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const notificationsLabel = (count) => {
        if (count === 0) {
            return '알림이 없습니다';
        }
        if (count > 99) {
            return '99개 이상의 알림이 있습니다';
        }
        return `${count} 알림`;
    }

    return (
        <>
            <IconButton
                aria-label={notificationsLabel(notification.length)}
                size="large"
                id="noti-button"
                aria-controls={open ? 'long-menu' : undefined}
                aria-expanded={open ? 'true' : undefined}
                aria-haspopup="true"
                onClick={handleClick}
                color="inherit"
            >
                <Badge badgeContent={notification.length} color="error">
                    <NotificationsIcon/>
                </Badge>
            </IconButton>
            <Menu
                id="long-menu"
                MenuListProps={{
                    'aria-labelledby': 'noti-button',
                }}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                slotProps={{
                    paper: {
                        style: {
                            maxHeight: ITEM_HEIGHT * 4.5,
                            width: '35ch',
                        },
                    },
                }}
            >
                <List sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
                    {notification.length === 0 ? (
                        <ListItem>
                            <ListItemText
                                primary="알림이 없습니다"
                                secondary="현재 새로운 알림이 없습니다."
                            />
                        </ListItem>
                    ) : (
                        notification?.map((noti, index) => (
                            <React.Fragment key={index}>
                                <ListItem alignItems="flex-start">
                                    <ListItemAvatar>
                                        <Avatar alt="알림 보낸 사람" src={noti.from} />
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={noti.message}
                                        secondary={noti.date}
                                    />
                                </ListItem>
                                <Divider variant="inset" component="li" />
                            </React.Fragment>
                        ))
                    )}
                </List>
            </Menu>
        </>
    );
}

export default Notification;

