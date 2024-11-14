import React, { useState } from 'react';
import { Box, Typography, Button, InputBase, Divider, IconButton } from '@mui/material';
import { useTheme } from '@mui/material';
import { ThumbUp } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';

const PostDetailsPage = ({ isSmallScreen, isMediumScreen }) => {
    const theme = useTheme();
    // const study = location.state.study;
    const params = useParams();
    const { postId } = useParams();
    const navigate = useNavigate();
    // const { userInfo } = useUser();
    const userInfo = { id: 'USER#123', username: 'esquadback'}      // 유저 더미 데이터
    // const [post, setPost] = useState(null);
    const [post, setPost] = useState( {"id": 32, "writer": "룰루레몬", "title": "테스트부치기", "views": 5, "createdAt": "2024-10-11" ,"description": "룰루랄라라람", "likes": 2} );   // 더미 포스트
    // const [comments, setComments] = useState([]);
    const [comments, setComments] = useState([
        {
            writer: 'Alice',
            createdAt: new Date().toISOString(),
            content: '정말 좋은 게시글입니다! 공유해 주셔서 감사합니다.',
            likes: 5,
        },
        {
            writer: 'Bob',
            createdAt: new Date().toISOString(),
            content: '매우 유익한 내용이네요. 감사합니다!',
            likes: 3,
        },
        {
            writer: 'Charlie',
            createdAt: new Date().toISOString(),
            content: '여기에서 언급된 내용에 대해 질문이 있습니다...',
            likes: 1,
        },
        {
            writer: 'Diana',
            createdAt: new Date().toISOString(),
            content: '놀라운 통찰력이네요! 이런 콘텐츠를 더 기대합니다.',
            likes: 8,
        },
        {
            writer: 'Eve',
            createdAt: new Date().toISOString(),
            content: '몇 가지 점에는 동의하지 않지만, 전체적으로 좋은 글입니다.',
            likes: 2,
        },
        {
            writer: 'Frank',
            createdAt: new Date().toISOString(),
            content: '이 내용을 보고 주제를 훨씬 더 잘 이해하게 되었어요. 감사합니다!',
            likes: 7,
        },
        {
            writer: 'Grace',
            createdAt: new Date().toISOString(),
            content: '기사의 두 번째 부분에 대해 좀 더 설명해 주실 수 있나요?',
            likes: 4,
        },
        {
            writer: 'Hank',
            createdAt: new Date().toISOString(),
            content: '잘 설명해 주셨네요! 좋은 글 계속 부탁드립니다!',
            likes: 6,
        },
        {
            writer: 'Ivy',
            createdAt: new Date().toISOString(),
            content: '이 내용을 실제로 적용하는 방법을 아는 분 계신가요?',
            likes: 0,
        },
        {
            writer: 'Jack',
            createdAt: new Date().toISOString(),
            content: '좋은 팁이네요, 꼭 시도해 볼게요.',
            likes: 9,
        },
    ])
    const [newComment, setNewComment] = useState('');
    const [likes, setLikes] = useState(0);
    const [isLiked, setIsLiked] = useState(false);

    const handleLike = async () => {

    };
    const handleCommentSubmit = async () => {

    };
    const handleEdit = () => {
    };
    const handleDelete = async () => {

    };
    if (!post) return <Typography>Loading...</Typography>;

    return (
        <Box sx={{ width: '100%', p: 2 }}>
            <Button onClick={() => navigate(`/teams/1/questions`)} variant="text" sx={{ mb: 2 }}>
                &larr; 뒤로가기
            </Button>
            <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    <Typography variant="h5" fontWeight="bold">
                        {post.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                        작성자: {userInfo.username} · {new Date(post.createdAt).toLocaleString()} · 조회수: {post.views || 0}
                    </Typography>
                </Box>
                <Box>
                    <Button variant="outlined" onClick={handleEdit} sx={{ mr: 1 }}>
                        수정
                    </Button>
                    <Button variant="outlined" color="error" onClick={handleDelete}>
                        삭제
                    </Button>
                </Box>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {/* 이미지 표시 */}
            {post.imageUrl && (
                <Box sx={{ mb: 3 }}>
                    <img src={post.imageUrl} alt="게시글 이미지" style={{ maxWidth: '100%', borderRadius: 8 }} />
                </Box>
            )}

            <Box sx={{ mb: 4 }}>
                <Typography variant="body1">{post.content}</Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
                <IconButton onClick={handleLike} color={isLiked ? "primary" : "default"}>
                    <ThumbUp />
                </IconButton>
                <Typography>{likes}명이 좋아합니다</Typography>
            </Box>

            {/* Comment Section */}
            <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    답변 {comments.length}
                </Typography>
                <InputBase
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="댓글을 작성해보세요..."
                    fullWidth
                    sx={{
                        mb: 2,
                        p: 2,
                        border: '1px solid #ccc',
                        borderRadius: 1,
                    }}
                />
                <Button
                    onClick={handleCommentSubmit}
                    variant="contained"
                    sx={{ mb: 3, backgroundColor: theme.palette.primary.main }}
                >
                    댓글 작성
                </Button>
                <Divider sx={{ mb: 3 }} />

                {comments.map((comment, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body1" fontWeight="bold">
                                {comment.writer}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                {new Date(comment.createdAt).toLocaleString()}
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            {comment.content}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <Typography variant="caption">👍 {comment.likes}</Typography>
                            <Typography variant="caption">답글</Typography>
                        </Box>
                        <Divider sx={{ mt: 2 }} />
                    </Box>
                ))}
            </Box>
        </Box>
    );
};

export default PostDetailsPage;