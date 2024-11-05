import axios from 'axios';
import React, { useState } from 'react';
import { Box, Button, Typography, InputBase, Chip, TextField, IconButton } from '@mui/material';
import { useTheme } from '@mui/material';
import { Autocomplete } from '@mui/material';
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Delete";
import { useUser } from '/src/components/form/UserContext'; // 사용자 정보 사용
import { useNavigate } from 'react-router-dom'; // 페이지 이동을 위한 훅

const PostCreationPage = ({ onCancel }) => {
    const theme = useTheme();
    const navigate = useNavigate(); // 페이지 이동을 위한 훅 선언
    // const { userInfo } = useUser();
    const userInfo = { id: 28, username: 'esquadback'}      // 유저 더미 데이터
    const [activeTab, setActiveTab] = useState('질문');
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState([]);
    const [file, setFile] = useState(null);

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

    const handleFileUpload = (event) => {
        const uploadedFile = event.target.files[0];
        if (uploadedFile) {
            setFile(uploadedFile);
        }
    };

    const handleFileDelete = () => {
        setFile(null);
    };

    const handleSubmit = async () => {

    };

    return (
        <Box
            sx={{
                // border: '1px solid',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                maxWidth: '650px',  // modal 창 가로너비 고정
                height: '80vh',     // modal 창 세로너비 고정 (전체 뷰포트 80%)
                mx: 'auto',
                my: 'auto',
                py: 2,
            }}
        >
            <Box sx={{ display: 'flex', gap: 3, mb: 2, borderBottom: `1px solid ${theme.palette.primary.light}`}}>
                {/* 탭 메뉴 */}
                <Box sx={{ display: 'flex', gap: 3, mb: 2, borderBottom: `1px solid ${theme.palette.primary.light}` }}>
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
            </Box>

            {/*<Divider sx={{ mb: 2 }} />*/}

            {renderTabContent()}

            {/* 파일 첨부 */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                <Button
                    variant="contained"
                    component="label"
                    startIcon={<AttachFileIcon />}
                    sx={{ backgroundColor: theme.palette.primary.main, color: '#fff' }}
                >
                    파일 첨부
                    <input type="file" hidden onChange={handleFileUpload} />
                </Button>
                {file && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">{`${file.name} (${(file.size / 1024).toFixed(2)} KB)`}</Typography>
                        <IconButton onClick={handleFileDelete} size="small">
                            <DeleteIcon />
                        </IconButton>
                    </Box>
                )}
            </Box>

            {/* 등록/취소 버튼 */}
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

