import {
  Box,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import NotificationItem from "./NotificationItem";

const NotificationList = ({
  notifications,
  isFetching,
  handleMarkAsSave,
  handleReleaseSave,
  formatTimeAgo,
  theme,
}) => (
  <List sx={{ width: "100%", paddingBottom: 6 }}>
    {notifications.length > 0 ? (
      notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          handleMarkAsSave={handleMarkAsSave}
          handleReleaseSave={handleReleaseSave}
          formatTimeAgo={formatTimeAgo}
          theme={theme}
        />
      ))
    ) : (
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
);

export default NotificationList;
