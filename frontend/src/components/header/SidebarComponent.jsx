import React from 'react';
import {
    alpha,
    Avatar,
    Box, Divider,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Typography
} from '@mui/material';
import { useTheme } from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import SpaceDashboardIcon from '@mui/icons-material/SpaceDashboard';
import Groups3Icon from '@mui/icons-material/Groups3';
import HomeIcon from '@mui/icons-material/Home';
import ArticleIcon from '@mui/icons-material/Article';
import FolderIcon from '@mui/icons-material/Folder';
import BookmarksIcon from '@mui/icons-material/Bookmarks';
import TagIcon from '@mui/icons-material/Tag';
import PeopleIcon from '@mui/icons-material/People';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CommunityIcon from '@mui/icons-material/Groups2';
import AbcIcon from '@mui/icons-material/Abc';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import {Link} from "react-router-dom";

const SidebarList = ({ items, drawerOpen, sidebarOpen }) => (
    <List>
        {items.map((item, index) => (
            <Link to={item.link} key={index} style={{ textDecoration: 'none', color: 'inherit' }}>
                <ListItem
                    button
                    sx={{
                        display: 'flex',
                        flexDirection: drawerOpen ? 'row' : sidebarOpen ? 'row' : 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                        padding: sidebarOpen ? '8px 16px' : '8px 0',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                    }}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 'auto !important',
                            display: 'flex',
                            justifyContent: 'center',
                            marginBottom: sidebarOpen ? 0 : 1,
                            alignItems: 'center',
                        }}
                    >
                        {item.icon}
                    </ListItemIcon>

                    <ListItemText
                        primary={item.text}
                        sx={{
                            whiteSpace: 'wrap',
                            textAlign: 'center',
                            fontSize: sidebarOpen ? '1rem' : '7px !important',
                            transition: 'font-size 0.3s ease',
                        }}
                    />
                </ListItem>
            </Link>
        ))}
    </List>
);

const SidebarComponent = ({ isSmallScreen, drawerOpen, sidebarOpen, handleDrawerClose, selectedTab, selectedTeam }) => {
    console.log(selectedTeam);
    const theme = useTheme();
    const communityItems = [
        { text: '질문 및 답변', icon: <QuizIcon />, link: '/community/questions' },
        { text: '자유게시판', icon: <SpaceDashboardIcon />, link: '/community/general' },
        { text: '스터디 모집', icon: <Groups3Icon />, link: '/community/team-recruit' },
    ];

    // const homeItems = [
    //     { text: 'Home', icon: <HomeIcon />, link: '/' },
    // ]

    const studyItems = [
        { text: '스터디', icon: <AbcIcon />, link: `/teams/${selectedTeam?.id}/study` },
        { text: '도서 검색', icon: <MenuBookIcon />, link: `/teams/${selectedTeam?.id}/book/search` },
        { text: '질문', icon: <QuizIcon />, link: `/teams/${selectedTeam?.id}/questions` },
        // { text: 'Articles', icon: <ArticleIcon /> },
        // { text: 'For You', icon: <FolderIcon /> },
        // { text: 'Collections', icon: <SpaceDashboardIcon /> },
        // { text: 'Bookmarks', icon: <BookmarksIcon /> },
        // { text: 'Tags', icon: <TagIcon /> },
    ];

    const manageItems = [
        { text: '크루', icon: <PeopleIcon  />, link: '/manage/crew' },
        // { text: 'Communities', icon: <CommunityIcon /> },
        // { text: '대시보드', icon: <DashboardIcon /> },
        { text: '설정', icon: <SettingsIcon  />, link: '/manage/settings' },
    ];

    const dangerItems = [
        { text: '나가기', icon: <LogoutIcon  />, link: '/logout' },
    ];

    const sidebarContent = (
        <>
            {selectedTab === 0 ? (
                <SidebarList items={communityItems} drawerOpen={drawerOpen} sidebarOpen={sidebarOpen} />
            ) : (
                <Box>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                            textAlign: 'center',
                            py: 2,
                            pl: 1,
                            '&:hover': {
                                backgroundColor: alpha(theme.palette.background.gray, 0.3),
                                cursor: 'pointer',
                            },
                        }}
                    >
                        <IconButton
                            color="inherit"
                            sx={{
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.main, 0),
                                },
                                gap: 3,
                            }}
                        >
                            <Avatar
                                alt="Team Profile"
                                src="/src/assets/user-avatar.png"
                                sx={{
                                    transition: 'width 0.3s ease',
                                    width: 46,
                                    height: 46
                                }}
                            />
                            <Typography variant="text" sx={{mb: 2, fontWeight: 'bolder'}} >{selectedTeam.teamName}</Typography>
                        </IconButton>
                    </Box>
                    <Divider sx={{borderBottom: '1px solid #ddd'}} />

                    {/*<SidebarList items={homeItems} drawerOpen={drawerOpen} sidebarOpen={sidebarOpen} />*/}
                    {/*<Divider sx={{borderBottom: '1px solid #ddd'}} />*/}

                    {sidebarOpen && (   // 사이드바 닫힐 떈 생략
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mx: 2, mt: 2 }}>
                            스터디
                        </Typography>
                    )}
                    <SidebarList items={studyItems} drawerOpen={drawerOpen} sidebarOpen={sidebarOpen} />
                    <Divider sx={{borderBottom: '1px solid #ddd'}} />

                    {sidebarOpen && (
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mx: 2, mt: 2 }}>
                            관리
                        </Typography>
                    )}
                    <SidebarList items={manageItems} drawerOpen={drawerOpen} sidebarOpen={sidebarOpen} />
                    <Divider sx={{borderBottom: '1px solid #ddd'}} />

                    {sidebarOpen && (
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mx: 2, mt: 2, color: `${theme.palette.warning.main}`}}>
                            위험
                        </Typography>
                    )}
                    <SidebarList items={dangerItems} drawerOpen={drawerOpen} sidebarOpen={sidebarOpen} />
                </Box>
            )}
        </>
    );

    return isSmallScreen ? (
        <Drawer anchor="left" open={drawerOpen} onClose={handleDrawerClose}>
            <Box sx={{ width: 240, backgroundColor: '#fff', p: 2 }}>{sidebarContent}</Box>
        </Drawer>
    ) : (
        !isSmallScreen && (
            <Box
                sx={{
                    width: sidebarOpen ? '200px' : '4rem',
                    flexShrink: 0,
                    backgroundColor: '#fff',
                    transition: 'width 0.3s ease',
                    overflow: 'hidden',
                    height: '100%',
                    borderRight: `1px solid ${theme.palette.primary.main}`,
                }}
            >
                <Box sx={{ width: '100%', height: '100vh', paddingTop: 2 }}>{sidebarContent}</Box>
            </Box>
        )
    );
};

export default SidebarComponent;
