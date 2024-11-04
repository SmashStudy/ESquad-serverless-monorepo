import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    Card,
    CardContent,
    CardActions,
    Grid,
} from '@mui/material';
import { alpha, useTheme } from '@mui/material';
import SearchComponent from "../../../components/team/SearchComponent.jsx";
import {useNavigate, useParams} from "react-router-dom";

const StudyListPage = ({ isSmallScreen, isMediumScreen }) => {
    const theme = useTheme();
    const params = useParams();
    const navigate = useNavigate();
    const teamId = params.teamId;
    const [studys, setStudys] = useState([
        {"id": 2, "teamId": teamId, "bookId": 4, "title": "스터디읻이디리딩딩딩", "members": 12},
        {"id": 5, "teamId": teamId, "bookId": 2, "title": "케로케로케로디리딩딩딩", "members": 12},
        {"id": 1, "teamId": teamId, "bookId": 66, "title": "디리딩디읻", "members": 12},
        {"id": 9, "teamId": teamId, "bookId": 16, "title": "쿵쿵타리", "members": 12},
        {"id": 13, "teamId": teamId, "bookId": 53, "title": "삐기삐끼", "members": 12},
        {"id": 23, "teamId": teamId,"bookId": 38, "title": "이디리딩딩딩", "members": 12},
    ]);

    const [isPostModalOpen, setIsPostModalOpen] = useState(false);  // 2차

    const handleWriteButtonClick = () => {
        setIsPostModalOpen(true);
    };

    const handleClosePostModal = () => {
        setIsPostModalOpen(false);
    };

    return (
        <>
            {/* Filters and Search */}
            <Box
                sx={{
                    // border: '1px solid',    // 추후 삭제
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 3,
                    gap: 2,
                }}
            >
                <Box
                    sx={{
                        display: 'flex',
                        gap: 2,
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                        justifyContent: 'flex-start',
                    }}
                >
                    <Button
                        variant="text"
                        sx={{
                            fontSize: 'medium',
                            fontWeight: 'bold',
                            borderBottom: '2px solid',
                            borderColor: theme.palette.primary.main,
                        }}
                    >
                        전체
                    </Button>
                    <Button variant="text" sx={{ fontSize: 'medium' }}>
                        진행중
                    </Button>
                    <Button variant="text" sx={{ fontSize: 'medium' }}>
                        종료
                    </Button>
                </Box>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 2,
                        // mt: 2,
                        width: '90%',
                    }}
                >
                    <SearchComponent
                        isSmallScreen={isSmallScreen}
                        isMediumScreen={isMediumScreen}
                        placeholderText='찾아보고픈 스터디가 있나요?'
                        buttonBackgroundColor={theme.palette.primary.main}
                        buttonVariant='contained'
                    />
                </Box>
            </Box>

            {/* Posts List as Cards in a Grid */}
            <Grid container spacing={3} sx={{ width: '100%', px: 2 }}>
                {studys.map((study, index) => (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card
                            button
                            onClick={() =>
                                navigate(`/teams/${params.teamId}/study/${study.id}`, {
                                    state: { study }
                                })
                            }
                            sx={{
                                cursor: 'pointer',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'space-between',
                            }}
                        >
                            <CardContent>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        mb: 2,
                                    }}
                                >
                                    <Typography variant="h6" fontWeight="bold">
                                        {study.title}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ color: theme.palette.grey[700], mb: 2 }}>
                                    인원수: {study.members}명
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                    {['react-native', 'typescript', 'nestjs', 'react-query', 'zustand'].map(
                                        (tag, idx) => (
                                            <Button key={idx} variant="outlined" size="small" sx={{ borderRadius: 4, fontSize: '0.7rem' }}>
                                                {tag}
                                            </Button>
                                        )
                                    )}
                                </Box>
                            </CardContent>
                            <CardActions sx={{ justifyContent: 'flex-end' }}>
                                <Button variant="outlined" size="small" sx={{ color: theme.palette.primary.main }}>
                                    스트리밍
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            {/* Pagination */}
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    alignItems: 'center',
                    my: 3,
                }}
            >
                <Button variant="outlined" sx={{ mx: 1 }}>
                    이전
                </Button>
                {[1, 2, 3, 4, 5].map((page) => (
                    <Button key={page} variant="text" sx={{ mx: 1 }}>
                        {page}
                    </Button>
                ))}
                <Button variant="outlined" sx={{ mx: 1 }}>
                    다음
                </Button>
            </Box>
        </>
    );
};

export default StudyListPage;
