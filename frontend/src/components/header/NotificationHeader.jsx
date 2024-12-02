import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DoneAllIcon from "@mui/icons-material/Done";
import TurnedInIcon from "@mui/icons-material/TurnedIn";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/system";

const NotificationHeader = ({
  showArchived,
  handleToggleArchived,
  handleNotificationsClose,
  handleMarkAllAsRead,
  theme,
}) => (
  <Box
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: theme.spacing(1, 2), // Add spacing for alignment
      borderBottom: `1px solid ${alpha(theme.palette.common.black, 0.1)}`, // Optional border for separation
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
            showArchived ? handleNotificationsClose : handleToggleArchived
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
);

export default NotificationHeader;
