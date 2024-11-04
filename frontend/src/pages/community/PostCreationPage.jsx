// PostCreationPage.js
import React, { useState } from 'react';
import { Box, Button, Typography, InputBase, Divider, Chip, TextField } from '@mui/material';
import { useTheme } from '@mui/material';
import { Autocomplete } from '@mui/material';

const PostCreationPage = ({ onCancel }) => {
    const theme = useTheme();
    const [activeTab, setActiveTab] = useState('질문');
    const [tags, setTags] = useState([]);

    const renderTabContent = () => {
        const placeholders = {
            '질문':
                ' - 학습 관련 질문을 남겨주세요. 상세히 작성하면 더 좋아요! \n - 서로 예의를 지키며 존중하는 게시판을 만들어주세요!',
            '고민있어요': '고민 내용을 입력하세요',
            '스터디': '스터디 설명을 입력하세요',
        };

        return (
            <>
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        px: 1,
                        mb: 3,
                    }}
                >
                    <InputBase
                        placeholder={activeTab === '질문' ? '제목에 핵심 내용을 요약해보세요.' : activeTab === '고민있어요' ? '어떤 고민이 있으신가요?' : '스터디 제목을 입력하세요.'}
                        sx={{
                            width: '100%',
                            p: 1,
                            border: 'none',
                            borderBottom: '1px solid #ccc',
                            borderRadius: 1,
                            fontSize: '1.4rem',
                            fontWeight: 'bolder',
                        }}
                    />
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        mb: 2,
                    }}
                >
                    <Typography variant="h8" sx={{ px: 1}}>
                        태그를 설정하세요 (최대 10개)
                    </Typography>
                    <Autocomplete
                        multiple
                        freeSolo
                        options={[]}
                        value={tags}
                        onChange={(event, newValue) => setTags(newValue)}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip variant="outlined" size='small' label={option} {...getTagProps({ index })}/>
                            ))
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                size="small"
                                variant="standard"
                                placeholder="입력 후 엔터키를 누르면 태그가 생성됩니다."
                                sx={{
                                    width: '100%',
                                    p: 1,
                                }}
                            />
                        )}
                    />
                </Box>

                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                        px: 1,
                    }}
                >
                    <InputBase
                        placeholder={placeholders[activeTab]}
                        multiline
                        minRows={15}
                        sx={{
                            width: '100%',
                            p: 2,
                            border: '1px solid #ccc',
                            borderRadius: 1,
                        }}
                    />
                </Box>
            </>
        );
    };

    const handleSubmit = () => {
        const urlSuffix = activeTab === '질문' ? 'type=qna' : activeTab === '고민있어요' ? 'type=worry' : 'type=study';
        console.log(`Submit URL with suffix: ${urlSuffix}`);
    };

    return (
        <Box
            sx={{
                // border: '1px solid',
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                maxWidth: '650px',  // modal 창 가로너비 고정
                height: '80vh',     // modal 창 세로너비 고정 (전체 뷰포트 80%)
                mx: 'auto',
                my: 'auto',
                py: 2,
            }}
        >
            <Box sx={{ display: 'flex', gap: 3, mb: 2, borderBottom: `1px solid ${theme.palette.primary.light}`}}>
                {['질문', '고민있어요', '스터디'].map((tab) => (
                    <Button
                        key={tab}
                        variant="text"
                        onClick={() => setActiveTab(tab)}
                        sx={{
                            fontSize: 'large',
                            fontWeight: activeTab === tab ? 'bold' : 'normal',
                            borderBottom: activeTab === tab ? '2px solid' : 'none',
                            borderColor: activeTab === tab ? theme.palette.primary.main : 'transparent',
                        }}
                    >
                        {tab}
                    </Button>
                ))}
            </Box>
            {/*<Divider sx={{ mb: 2 }} />*/}
            {renderTabContent()}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mt: 3,
                    px: 1,
                }}
            >
                <Button variant="contained" onClick={onCancel} sx={{ color: '#fff', backgroundColor: theme.palette.warning.main, px: 4}}>
                    취소
                </Button>
                <Button variant="contained" sx={{ backgroundColor: theme.palette.primary.main, color: '#fff', px: 4 }}>
                    등록
                </Button>
            </Box>
        </Box>
    );
};

export default PostCreationPage;

