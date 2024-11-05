import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Button, Typography, List, InputBase } from '@mui/material';
import { alpha, useTheme } from '@mui/material';
import PostCreationDialog from "../../components/content/community/PostCreationDialog.jsx";
import {Link} from "react-router-dom";

const PostListPage = ({ isSmallScreen, isMediumScreen }) => {
    const theme = useTheme();
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    // const [posts, setPosts] = useState([]);
    const [posts, setPosts] = useState([
        {
            id: 1,
            writer: '룰루레몬',
            title: '테스트부치기 1',
            views: 10,
            createdAt: '2024-10-01',
            content: '룰루랄라라람 1',
            likes: 3,
        },
        {
            id: 2,
            writer: '김코딩',
            title: '프로그래밍 기초',
            views: 25,
            createdAt: '2024-10-02',
            content: '기초부터 차근차근 배우자',
            likes: 8,
        },
        {
            id: 3,
            writer: '박해커',
            title: '웹 개발 트렌드',
            views: 15,
            createdAt: '2024-10-03',
            content: '최신 웹 개발 기술 소개',
            likes: 5,
        },
        {
            id: 4,
            writer: '이디버깅',
            title: '디버깅 팁',
            views: 8,
            createdAt: '2024-10-04',
            content: '효과적인 디버깅 방법',
            likes: 2,
        },
        {
            id: 5,
            writer: '정테스터',
            title: '테스트 자동화',
            views: 30,
            createdAt: '2024-10-05',
            content: '테스트 자동화의 장점',
            likes: 10,
        },
        {
            id: 6,
            writer: '최구현',
            title: '구현 방식 비교',
            views: 20,
            createdAt: '2024-10-06',
            content: '다양한 구현 방식을 비교해 보자',
            likes: 6,
        },
        {
            id: 7,
            writer: '홍디자인',
            title: '디자인 패턴',
            views: 40,
            createdAt: '2024-10-07',
            content: '디자인 패턴의 중요성',
            likes: 12,
        },
        {
            id: 8,
            writer: '서유아이',
            title: 'UI/UX 가이드',
            views: 18,
            createdAt: '2024-10-08',
            content: '더 나은 사용자 경험을 위한 가이드',
            likes: 4,
        },
        {
            id: 9,
            writer: '박성능',
            title: '성능 최적화',
            views: 35,
            createdAt: '2024-10-09',
            content: '웹 성능 최적화 방법',
            likes: 9,
        },
        {
            id: 10,
            writer: '이배포',
            title: '배포 전략',
            views: 12,
            createdAt: '2024-10-10',
            content: '안전한 배포를 위한 전략',
            likes: 3,
        },
        {
            id: 11,
            writer: '김데이터',
            title: '데이터 분석 기초',
            views: 28,
            createdAt: '2024-10-11',
            content: '데이터 분석을 시작하는 방법',
            likes: 7,
        },
        {
            id: 12,
            writer: '이클라우드',
            title: '클라우드 컴퓨팅',
            views: 22,
            createdAt: '2024-10-12',
            content: '클라우드 서비스의 이해',
            likes: 6,
        },
        {
            id: 13,
            writer: '한보안',
            title: '보안 체크리스트',
            views: 50,
            createdAt: '2024-10-13',
            content: '보안을 위한 필수 체크리스트',
            likes: 15,
        },
        {
            id: 14,
            writer: '전네트워크',
            title: '네트워크 기초',
            views: 17,
            createdAt: '2024-10-14',
            content: '네트워크의 기본 개념',
            likes: 4,
        },
        {
            id: 15,
            writer: '서지식',
            title: '지식 공유',
            views: 27,
            createdAt: '2024-10-15',
            content: '지식을 나누며 함께 성장하자',
            likes: 8,
        },
    ])
    const [teamId, setTeamId] = useState(1); // 임시로 팀 ID 설정

    // 게시글 목록을 불러오는 함수
    // const fetchPosts = async () => {
    //     try {
    //         const response = await axios.get('http://localhost:8080/api/questions');
    //         setPosts(response.data.content); // 페이징된 결과에서 content 사용
    //     } catch (err) {
    //         console.error("게시글을 불러오는 중 오류가 발생했습니다:", err);
    //     }
    // };
    // useEffect(() => {
    //     fetchPosts(); // 컴포넌트가 마운트될 때 게시글 목록 불러오기
    // }, []);

    const handleWriteButtonClick = () => {
        setIsPostModalOpen(true);
    };

    const handleClosePostModal = () => {
        setIsPostModalOpen(false);
        // fetchPosts(); // 글 작성 후 게시글 목록 갱신
    };

    return (
        <Box
            sx={{
                // border: '1px solid',    // 실제 community board / team 데이터 render
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
                {posts.map((post) => (
                    <Link
                        to={`/teams/${teamId}/questions/${post.id}`}
                        key={post.id}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <Box
                            key={post.id}
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
                                <Button variant="outlined" size="small" disabled>{post.status || '미해결'}</Button>
                                <Typography variant="body1" fontWeight="bold">{post.title}</Typography>
                            </Box>
                            <Typography variant="body2" sx={{ color: theme.palette.grey[700], mb: 1 }}>질문 설명이 여기에 표시됩니다. 질문의 간단한 설명이나 내용을 보여주는 부분입니다.</Typography>
                            <Typography variant="body2" sx={{ color: theme.palette.grey[700], mb: 1 }}>
                                {post.content.substring(0, 100)}...
                            </Typography>

                            {/* Tags */}
                            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                                {post.tags?.map((tag, idx) => (
                                    <Button key={idx} variant="outlined" size="small" sx={{ borderRadius: 4 }}>
                                        {tag}
                                    </Button>
                                ))}
                            </Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: isSmallScreen ? 'column' : 'row', gap: isSmallScreen ? 1 : 0 }}>
                                <Typography variant="caption" color="text.secondary">{post.writerName} · {new Date(post.createdAt).toLocaleString()}</Typography>
                                <Box sx={{ display: 'flex', gap: 2, mt: isSmallScreen ? 1 : 0 }}>
                                    <Typography variant="caption">👍 {post.likes}</Typography>
                                    <Typography variant="caption">👁 {post.views || 0}</Typography>
                                    <Typography variant="caption">💬 {post.comments?.length || 0}</Typography>
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

            {/* 글 작성 모달 */}
            <PostCreationDialog open={isPostModalOpen} onClose={handleClosePostModal} />
        </Box>

    );
};



export default PostListPage;