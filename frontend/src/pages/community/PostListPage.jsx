import React, { useState } from 'react';
import { Box, Button, Typography, List, InputBase, Dialog, DialogContent } from '@mui/material';
import { alpha, useTheme } from '@mui/material';
import PostCreationPage from '../../components/content/community/PostCreationDialog.jsx';
import PostCreationDialog from "../../components/content/community/PostCreationDialog.jsx";
import {Link} from "react-router-dom";

const PostListPage = ({ isSmallScreen, isMediumScreen }) => {
    const theme = useTheme();
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [showPostDetails, setShowPostDetails] = useState(false);

    const handleWriteButtonClick = () => {
        setIsPostModalOpen(true);
    };

    const handleClosePostModal = () => {
        setIsPostModalOpen(false);
    };

    const handlePostClick = () => {
        setShowPostDetails(true);
    };

    const handleBackToList = () => {
        setShowPostDetails(false);
    };

    return (
        <Box
            sx={{
                border: '1px solid',    // 실제 community board / team 데이터 render
                mb: 2,
                height: '100%',
                width: '100%',
                overflowX: 'auto',
                overflowY: 'auto',
            }}
        >
            {/* Filters and Search */}
            <Box
                sx={{
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
                    <Button variant="text" sx={{ fontSize: 'medium', fontWeight: 'bold', borderBottom: '2px solid', borderColor: theme.palette.primary.main }}>전체</Button>
                    <Button variant="text" sx={{ fontSize: 'medium' }}>미해결</Button>
                    <Button variant="text" sx={{ fontSize: 'medium' }}>해결됨</Button>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, width: '90%' }}>
                    <InputBase
                        placeholder="궁금한 질문을 검색해보세요!"
                        sx={{
                            width: '100%',
                            p: 1,
                            border: '1px solid #ccc',
                            borderRadius: 1,
                        }}
                    />
                    <Button variant="contained" sx={{ fontSize: 'medium', backgroundColor: theme.palette.primary.main }}>검색</Button>
                </Box>
            </Box>

            {/* Sort and Write Button */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    mb: 2,
                    flexDirection: isSmallScreen ? 'column' : 'row',
                    gap: isSmallScreen ? 2 : 0,
                }}
            >
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    <Button variant="text" sx={{color: theme.palette.text.secondary}}>최신순</Button>
                    <Button variant="text" sx={{color: theme.palette.text.secondary}}>정확도순</Button>
                    <Button variant="text" sx={{color: theme.palette.text.secondary}}>답변많은순</Button>
                    <Button variant="text" sx={{color: theme.palette.text.secondary}}>좋아요순</Button>
                </Box>
                <Button
                    variant="contained"
                    onClick={handleWriteButtonClick}
                    sx={{
                        backgroundColor: theme.palette.secondary.main,
                        color: '#fff',
                        mr: 2,      // 질문 List 와 위치 맞춤
                    }}
                >
                    글쓰기
                </Button>
            </Box>

            {/* Posts List */}
            <List
                sx={{
                    width: '100%',
                    pr: 2,
                }}
            >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((post, index) => (
                    <Link
                        to={`/community/questions/${post.id}`}
                        className={`question-post-${index}`}
                        key={index}
                        sx={{
                            textDecoration: 'none',
                            color: 'inherit',
                        }}
                    >
                        <Box
                            key={index}
                            sx={{
                                mb: 2,
                                borderBottom: '1px solid #ddd',
                                px: 2,
                                py: 2,
                                '&:hover': {
                                    backgroundColor: alpha(theme.palette.primary.light, 0.1),
                                    cursor: 'pointer',
                                },
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isSmallScreen ? 'center' : 'stretch',
                                justifyContent: isSmallScreen ? 'center' : 'flex-start'
                            }}
                        >
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexDirection: isSmallScreen ? 'column' : 'row' }}>
                                <Button variant="outlined" size="small" disabled>미해결</Button>
                                <Typography variant="body1" fontWeight="bold">[해결] 제목 예시 - 질문 내용이 간단히 들어가는 영역입니다.</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.grey[700], mb: 1 }}>질문 설명이 여기에 표시됩니다. 질문의 간단한 설명이나 내용을 보여주는 부분입니다.</Typography>
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                {['react-native', 'typescript', 'nestjs', 'react-query', 'zustand'].map((tag, idx) => (
                                    <Button key={idx} variant="outlined" size="small" sx={{ borderRadius: 4 }}>
                                        {tag}
                                    </Button>
                                ))}
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isSmallScreen ? 'column' : 'row', gap: isSmallScreen ? 1 : 0 }}>
                                <Typography variant="caption" color="text.secondary">작성자 이름 · 17분 전 · 카테고리명</Typography>
                                <Box sx={{ display: 'flex', gap: 2, mt: isSmallScreen ? 1 : 0 }}>
                                    <Typography variant="caption">👍 0</Typography>
                                    <Typography variant="caption">👁 3</Typography>
                                    <Typography variant="caption">💬 0</Typography>
                                </Box>
                            </Box>
                        </Box>
                    </Link>
                ))}
            </List>

            {/* Pagination */}
            <Box
                sx={{
                    width: '100%',
                    display: 'flex',
                    flexWrap: 'wrap',           // width: '100%', display: flex 일 때 설정하면 width 안에서 flex 잡음
                    justifyContent: 'center',
                    alignItems: 'center',
                    my: 3,
                }}
            >
                <Button variant="outlined" sx={{ mx: 1 }}>이전</Button>
                {[1, 2, 3, 4, 5].map((page) => (
                    <Button key={page} variant="text" sx={{ mx: 1 }}>{page}</Button>
                ))}
                <Button variant="outlined" sx={{ mx: 1 }}>다음</Button>
            </Box>

            {/* Post Creation Modal */}
            <PostCreationDialog open={isPostModalOpen} onClose={handleClosePostModal} />
        </Box>

    );
};



export default PostListPage;