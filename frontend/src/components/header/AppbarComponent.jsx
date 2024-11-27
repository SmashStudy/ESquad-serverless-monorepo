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
  styled,
  Toolbar,
  Typography,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
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
  const [nickname, setNickname] = useState("");
  const [error, setError] = useState("");
  const handleLogout = () => {
    navigate("/logout");
  };

  const fetchNickname = async () => {
    try {
      const response = await axios.get(
        "https://api.esquad.click/dev/users/get-nickname",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      );
      setNickname(response.data.nickname);
    } catch (err) {
      console.error("닉네임 가져오기 오류:", err);
      setError("닉네임을 가져오는 중 오류가 발생했습니다.");
    }
  };

  // 컴포넌트 로드 시 닉네임 가져오기
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      navigate("/google"); // 토큰이 없으면 로그인 페이지로 이동
    } else {
      fetchNickname();
    }
  }, [navigate]);

  const [userName, setUserName] = useState("로딩 중...");

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  useEffect(() => {
    const fetchToken = async () => {
      await delay(100); // 딜레이 안 달아두면 localstorage에 jwtToken 적재 되기도전에 useEffect 돌아가서 token null 뜸
      const token = localStorage.getItem("jwtToken");
      if (token) {
        const decodedToken = decodeJWT(token);
        if (decodedToken) {
          setUser({
            username: decodedToken.name || "Name",
            userId: decodedToken.email,
          });
        }
      }
    };
    fetchToken();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    alert("로그아웃 되었습니다. 다음에 또 만나요!");
    navigate("/google");
  };

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // Handle team menu open/close
  const handleTeamMenuClick = (event) => {
    setTeamAnchorEl(event.currentTarget);
  };
  const handleTeamMenuClose = () => {
    setTeamAnchorEl(null);
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
                    {nickname ? nickname.charAt(0).toUpperCase() : "유"}
                  </Avatar>
                  {/*<Typography variant="body1">{userInfo ? userInfo.nickname : "유저 이름"}</Typography>*/}
                  <Typography variant="body1">{nickname}</Typography>
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

              <Notifications
                userId={user ? user.userId : "유저 이름"}
                theme={theme}
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

export default AppBarComponent;
