import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SearchIcon from '@mui/icons-material/Search';
import CircleIcon from '@mui/icons-material/Circle';
import DoneIcon from '@mui/icons-material/Done';
import {
    alpha,
    AppBar,
    Avatar,
    Badge,
    Box,
    Button,
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
    Typography,
    useMediaQuery,
    useTheme
} from '@mui/material';
import axios from "axios";
import React, { useEffect, useState, useRef} from 'react';
import { Link, NavLink, useNavigate } from "react-router-dom";
import TeamCreationDialog from "../team/TeamCreationDialog.jsx";
// import useNotificationWebSocket from "../../hooks/useNotificationWebSocket.mjs";

// Function to calculate time ago in "minutes ago" format
const formatTimeAgo = (isoDate) => {
    const now = new Date();
    const createdAt = new Date(isoDate);
    const diffInSeconds = Math.floor((now - createdAt) / 1000);

    const minutes = Math.floor(diffInSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) {
        return '지금 막';
    } else if (minutes < 60) {
        return `${minutes} 분 전`;
    } else if (hours < 24) {
        return `${hours} 시간 전`;
    } else {
        return `${days} 일 전`;
    }
};

const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius,
    backgroundColor: alpha(theme.palette.common.white, 0.15),
    '&:hover': {
        backgroundColor: alpha(theme.palette.common.white, 0.25),
    },
    marginLeft: theme.spacing(3),
    marginRight: theme.spacing(3),
    border: `1px solid ${theme.palette.secondary.main}`, // Gold border for the search bar
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
    color: 'inherit',
    width: '100%',
    '& .MuiInputBase-input': {
        padding: theme.spacing(1, 1, 1, 0),
        paddingLeft: `calc(1em + ${theme.spacing(4)})`,
        transition: theme.transitions.create('width'),
        width: '100%',
    },
}));

const AppBarComponent = ({ handleSidebarToggle, handleTab, selectedTab, updateSelectedTeam, updateTeams, teams }) => {
    const navigate = useNavigate();
    // const { userInfo } = useUser();

    const handleLogout = () => {
        localStorage.removeItem('jwt');
        alert("로그아웃 되었습니다. 다음에 또 만나요!")
        navigate('/login');
    };

    const theme = useTheme();
    const [showSearchBar, setShowSearchBar] = useState(null);
    const [teamAnchorEl, setTeamAnchorEl] = useState(null);
    const [accountAnchorEl, setAccountAnchorEl] = useState(null);
    const [notificationsAnchorEl, setNotificationsAnchorEl] = useState(null);
    const [notifications, setNotifications] = useState([]);
    //     { id: 1, studyPageName: "페이지명1", message: "Brunch this weekend?", readStatus: false, avatar: "/static/images/avatar/1.jpg" },
    //     { id: 2, studyPageName: "페이지명2", message: "Meeting Reminder", readStatus: false, avatar: "/static/images/avatar/2.jpg" },
    // ]);
    // const { notifications, addNotification } = useNotifications();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
    const isVerySmallScreen = useMediaQuery('(max-width: 30vw)');

    const teamTabOpen = Boolean(teamAnchorEl);
    const [isTeamCreationModalOpen, setIsTeamCreationModalOpen] = useState(false);

    const userId = "USER#123";
    const API_GATEWAY_ID = "3vmpnm9327";
    const SOCKET_API_GATEWAY_ID = "ro2goaptcf";
    const socketRef = useRef(null); // 동일한 서버에 대한 다중 WebSocket 연결 방지

    console.log(notifications);

    const closeWebSocket = () => {
        // WebSocket 연결이 열려 있다면 닫고 초기화
        if (socketRef.current) {
            console.log("Closing WebSocket connection.");
            socketRef.current.close();
            socketRef.current = null;
        }
    };

    const connectToWebSocket = () => {
        if (socketRef.current && (socketRef.current.readyState === WebSocket.OPEN || socketRef.current.readyState === WebSocket.CONNECTING)) {
            console.log("WebSocket is already active. Skipping new connection.");
            return;
        }

        // WebSocket 서버 주소 정의 (사용자 ID를 쿼리 매개변수로 포함)
        const address = `wss://${SOCKET_API_GATEWAY_ID}.execute-api.us-east-1.amazonaws.com/dev?userId=${encodeURIComponent(userId)}`;
        const ws = new WebSocket(address);
        console.log("Creating a new WebSocket connection.");

        // WebSocket이 성공적으로 연결되었을 때
        ws.onopen = () => {
            console.log("WebSocket 연결 성공");

            // WebSocket 서버에 알림 데이터를 요청하는 메시지를 전송
            const fetchNotificationsMessage = JSON.stringify({
                action: "fetchNotifications", // 요청 작업 타입 정의
                userId: userId, // 사용자 ID 전달
            });
            ws.send(fetchNotificationsMessage);
        };

        // WebSocket으로 메시지를 받을 때
        ws.onmessage = (message) => {
            const obj = JSON.parse(message.data); // 메시지 데이터를 JSON으로 파싱
            console.log(`Received messages from websocket: ${JSON.stringify(obj)}`);
            onMessageReceived(obj); // 받은 메시지를 처리하는 함수 호출
        };

        // WebSocket 연결이 닫혔을 때
        ws.onclose = () => {
            console.log("WebSocket 연결 종료");
            socketRef.current = null; // 연결 종료 처리
        };

        // WebSocket 에러가 발생했을 때
        ws.onerror = (event) => {
            console.error("WebSocket 에러 발생:", event);
            socketRef.current = null; // 연결 종료 처리
        };

        socketRef.current = ws;
    };

// WebSocket에서 받은 메시지를 처리하는 함수
    const onMessageReceived = (message) => {
        // 메시지에 알림 데이터가 포함되어 있는 경우
        if (message.response) {
            setNotifications((prev) => [...prev, ...message.response]); // 알림 상태 업데이트
        }
        // 메시지가 개별 알림인 경우
        if (message.timestamp) {
            setNotifications((prev) => [...prev, message]); // 알림 상태 업데이트
        }
    };

    const fetchNotifications = async () => {
        try {
            // 초기 알림 데이터를 가져오기 위해 GET 요청
            const result = await axios({
                method: "GET",
                url: `https://${API_GATEWAY_ID}.execute-api.us-east-1.amazonaws.com/notification`,
                params: {userId: encodeURIComponent(userId)}, // 사용자 ID를 쿼리 매개변수로 전달
            });

            console.log(result.data); // 가져온 데이터 콘솔에 출력
            setNotifications(result.data); // 알림 상태 업데이트
        } catch (error) {
            console.error("메시지 가져오기 실패:", error); // 에러 로그 출력
        }
    }

// 컴포넌트가 마운트될 때 채팅 메시지를 가져오는 함수
    useEffect(() => {
        if (!socketRef.current) {
            connectToWebSocket(); // WebSocket 연결 시작
        }

        // 컴포넌트가 언마운트될 때 WebSocket 정리
        // return () => closeWebSocket();
    }, []);

    // Handle team menu open/close
    const handleTeamMenuClick = (event) => { setTeamAnchorEl(event.currentTarget); };
    const handleTeamMenuClose = () => { setTeamAnchorEl(null); };

    // Handle notifications menu open/close
    const handleNotificationsClick = (event) => { setNotificationsAnchorEl(event.currentTarget); };
    const handleNotificationsClose = () => { setNotificationsAnchorEl(null); };

    // Handle deleting a single notification
    // const handleDeleteNotification = (id) => {
    //     setNotifications((prevNotifications) => prevNotifications.filter((notification) => notification.id !== id));
    // };

    // Handle deleting all notifications
    // const handleDeleteAllNotifications = () => { setNotifications([]); };

    // Handle account menu open/close
    const handleAccountClick = (event) => { setAccountAnchorEl(event.currentTarget); };
    const handleAccountClose = () => { setAccountAnchorEl(null); };

    // 사용자의 팀탭에서 팀 선택
    const handleSelectedTeam = (i) => {
        updateSelectedTeam(i);
    };

    // Handle create team dialog open/close
    const handleCreateTeamButtonClick = () => { setIsTeamCreationModalOpen(true); };
    const handleCloseCreateTeamModal = () => { setIsTeamCreationModalOpen(false); };

    const handleMarkAsRead = async (notificationId) => {
        // try {
        //     await axios.post(`${endpointURl}/notifications/mark-as-read`, { notificationId });
        //     alert("Notifications marked as read!");
        // } catch (error) {
        //     console.error("Error marking notifications as read:", error);
        // }
        // setNotifications((prev) => [...prev, notificationId]);
    };

    return (
        <AppBar position="fixed" color="inherit" elevation={1} sx={{ width: `100%`, backgroundColor: '#fff' }}>
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', flex: 3 }}>
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
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <NavLink to="/community/questions" activeClassName='nav-logo'>
                            <img src="https://s3-esquad-public.s3.us-east-1.amazonaws.com/esquad-logo-nbk.png"
                                 alt="Logo" style={{height: '40px', marginRight: '16px'}}/>
                        </NavLink>
                    </Box>
                    {!showSearchBar && !isVerySmallScreen && (
                        <Box sx={{display: 'flex', gap: 1 }}>
                            <NavLink to="/community/questions" activeClassName='nav-community'>
                                <Button
                                    variant="text"
                                    size="large"
                                    onClick={() => handleTab(0)}
                                    sx={{
                                        cursor: 'pointer',
                                        fontSize: isSmallScreen ? 'small' : 'medium',
                                        backgroundColor: selectedTab === 0 ? alpha(theme.palette.primary.main, 0.2) : 'transparent',
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                        },
                                    }}
                                >
                                    커뮤니티
                                </Button>
                            </NavLink>

                            <Button
                                id='teamTab-button'
                                variant="text"
                                size="large"
                                onClick={handleTeamMenuClick}
                                aria-controls={teamTabOpen ? 'team-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={teamTabOpen ? 'true' : undefined}
                                sx={{
                                    cursor: 'pointer',
                                    fontSize: isSmallScreen ? 'small' : 'medium',
                                    backgroundColor: selectedTab === 1 ? alpha(theme.palette.primary.main, 0.2) : 'transparent',
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                    },
                                }}
                            >
                                팀
                            </Button>
                            <Menu
                                id='team-menu'
                                anchorEl={teamAnchorEl}
                                open={teamTabOpen}
                                onClose={handleTeamMenuClose}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                                MenuListProps={{
                                    'aria-labelledby': 'teamTab-button',
                                }}
                                sx={{
                                    transition: 'width 1s ease',
                                }}
                            >
                                <List>
                                    <ListItem button onClick={handleCreateTeamButtonClick} sx={{ '&:hover': { cursor: 'pointer', fontSize: '1.4rem' } }}>
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
                                                <Link to={`/teams/${team.id}`} className={`menu-team${index}`} key={index}>
                                                    <ListItem
                                                        button
                                                        onClick={() => updateSelectedTeam(index)}
                                                        sx={{ '&:hover': { cursor: 'pointer', fontSize: '1.4rem' } }}
                                                    >
                                                        <ListItemIcon>
                                                            <Avatar alt="Team Avatar" src='/src/assets/user-avatar.png' />
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

                <Box sx={{ display: 'flex', alignItems: 'center', flex: 4 }}>
                    {/* 3:4:3 Ratio */}
                    {!showSearchBar && (
                        <>
                            {isSmallScreen ? (
                                <IconButton color="inherit" onClick={() => setShowSearchBar(true)}>
                                    <SearchIcon />
                                </IconButton>
                            ) : (
                                <Search sx={{ flexGrow: 1 }}>
                                    <SearchIconWrapper>
                                        <SearchIcon />
                                    </SearchIconWrapper>
                                    <StyledInputBase placeholder="검색" inputProps={{ 'aria-label': 'search' }} />
                                </Search>
                            )}
                        </>
                    )}
                </Box>

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flex: 3, flexDirection: 'row-reverse' }}>
                    {/* 3:4:3 Ratio */}
                    {!showSearchBar && (
                        <>
                            <Box
                                sx={{
                                    borderRadius: 6,
                                    '&:hover': {
                                        backgroundColor: alpha(theme.palette.common.black, 0.1),
                                    },
                                    mx: 2,
                                }}
                            >
                                <IconButton
                                    color="inherit"
                                    onClick={handleAccountClick}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: alpha(theme.palette.primary.main, 0),
                                        },
                                        gap: 1,
                                    }}
                                >
                                    <Avatar alt="User Avatar" src="/src/assets/user-avatar.png" />
                                    {/*<Typography variant="body1">{userInfo ? userInfo.nickname : "유저 이름"}</Typography>*/}
                                    <Typography variant="body1">esquadback</Typography>
                                </IconButton>
                            </Box>
                            <Menu
                                anchorEl={accountAnchorEl}
                                open={Boolean(accountAnchorEl)}
                                onClose={handleAccountClose}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            >
                                <MenuItem
                                    onClick={handleAccountClose}
                                    sx={{
                                        gap: 1,
                                    }}
                                >
                                    <Avatar />
                                    <Link to= "/user/profile">
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
                            <Menu
                                anchorEl={notificationsAnchorEl}
                                open={Boolean(notificationsAnchorEl)}
                                onClose={handleNotificationsClose}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            >
                                {notifications.length > 0 ? (
                                    <>
                                        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                                            <Button
                                                onClick={handleNotificationsClose}
                                                sx={{
                                                    width: '50%',
                                                    borderRadius: 0,
                                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                                    '&:hover': {
                                                        backgroundColor: alpha(theme.palette.primary.main, 0.2),
                                                    },
                                                }}
                                            >
                                                모든 알림 확인
                                            </Button>
                                        </Box>

                                        <List sx={{ width: 360 }}>
                                            {notifications.map((notification) => (
                                                <ListItem
                                                    key={notification.id}
                                                    alignItems="flex-start"
                                                    sx={{
                                                        '&:hover': { cursor: 'pointer', backgroundColor: alpha(theme.palette.common.black, 0.1) },
                                                    }}
                                                >
                                                    <ListItemAvatar>
                                                        {notification.isRead === "0" ? (
                                                            <Badge
                                                                color="error"
                                                                variant="dot"
                                                                anchorOrigin={{
                                                                    vertical: 'top',
                                                                    horizontal: 'left',
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
                                                                sx={{ color: 'text.primary', fontWeight: 'bold' }}
                                                            >
                                                                {notification.sender}
                                                            </Typography>
                                                        }
                                                        secondary={
                                                            <React.Fragment>
                                                                {/* 알림 메시지 */}
                                                                <Typography
                                                                    component="span"
                                                                    variant="body2"
                                                                    sx={{ color: 'text.primary', display: 'block', marginTop: '4px' }}
                                                                >
                                                                    {notification.message}
                                                                </Typography>
                                                                {/* 생성 시간 */}
                                                                <Typography
                                                                    component="span"
                                                                    variant="caption"
                                                                    sx={{ color: 'text.secondary', display: 'block', marginTop: '4px' }}
                                                                >
                                                                    {formatTimeAgo(notification.createdAt)}
                                                                </Typography>
                                                            </React.Fragment>
                                                        }
                                                    />

                                                    {/* 읽음 처리 버튼 - 읽지 않은 알림에만 표시 */}
                                                    {notification.isRead === "0" && (
                                                        <IconButton edge="end" onClick={() => handleMarkAsRead(notification.id)}>
                                                            <DoneIcon sx={{ color: 'purple', fontSize: 16 }} />
                                                        </IconButton>
                                                    )}
                                                </ListItem>
                                            ))}
                                        </List>
                                    </>
                                ) : (
                                    // 알림이 없을 때 메시지
                                    <List sx={{ width: 360 }}>
                                        <ListItem>
                                            <ListItemText primary="알림이 없습니다." />
                                        </ListItem>
                                    </List>
                                )}
                            </Menu>
                        </>
                    )}
                </Box>

                {showSearchBar && (
                    <Search sx={{ flexGrow: 1 }}>
                        <SearchIconWrapper>
                            <SearchIcon />
                        </SearchIconWrapper>
                        <StyledInputBase placeholder="검색" inputProps={{ 'aria-label': 'search' }} />
                    </Search>
                )}
            </Toolbar>
        </AppBar>
    );
};

export default AppBarComponent;