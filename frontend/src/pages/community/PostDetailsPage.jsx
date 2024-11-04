import React from 'react';
import { Box, Typography, Button, InputBase, Divider } from '@mui/material';
import { useTheme } from '@mui/material';
import {useLocation, useParams} from "react-router-dom";

const PostDetailsPage = ({ isSmallScreen, isMediumScreen, onBack }) => {
    const theme = useTheme();
    const study = location.state.study;
    const params = useParams();
    const post = {"id": 32, "writer": "룰루레몬", "title": "테스트부치기", "description": "룰루랄라라람", "likes": 2}

    return (
        <Box sx={{ width: '100%', p: 2 }}>
            <Button onClick={onBack} variant="text" sx={{ mb: 2 }}>
                &larr; 뒤로가기
            </Button>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h5" fontWeight="bold">
                    [08.04 (금) 이벤트] 개발자 무엇이든 물어보세요
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    작성자 이름 · 2023.08.04 12:49 · 조회수 100
                </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />
            <Box sx={{ mb: 4 }}>
                <Typography variant="body1">
                    안녕하세요. 오늘은 여러분들과 함께 개발자로서 직업 선택 및 여러 가지 관련된 이야기들을 공유하려고 합니다. 자유롭게 질문을 남겨주세요.
                </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {/* Comment Section */}
            <Box>
                <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
                    답변 32
                </Typography>
                <InputBase
                    placeholder="댓글을 작성해보세요..."
                    fullWidth
                    sx={{
                        mb: 2,
                        p: 2,
                        border: '1px solid #ccc',
                        borderRadius: 1,
                    }}
                />
                <Button variant="contained" sx={{ mb: 3, backgroundColor: theme.palette.primary.main }}>
                    댓글 작성
                </Button>
                <Divider sx={{ mb: 3 }} />

                {[1, 2, 3, 4].map((reply, index) => (
                    <Box key={index} sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Typography variant="body1" fontWeight="bold">
                                유저 이름 {index + 1}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                2023.08.04 12:49
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ mt: 1 }}>
                            이 글에 대한 답변 내용이 여기에 표시됩니다.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <Typography variant="caption">👍 2</Typography>
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