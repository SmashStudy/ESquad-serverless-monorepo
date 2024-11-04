import React, { useState } from 'react';
import { Box, Button, Typography, InputBase, Divider, Chip, TextField, Select, MenuItem, Grid } from '@mui/material';
import { useTheme } from '@mui/material';
import dayjs from 'dayjs';

const StudyCreationPage = ({ onCancel, selectedTeamId, selectedBook }) => {
    const theme = useTheme();
    const formatDate = (date) => dayjs(date).format('YYYY/MM/DD');

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                maxWidth: '650px',
                height: '80vh',
                mx: 'auto',
                my: 'auto',
                py: 2,
            }}
        >
            {/* Book Details Section */}
            <Grid container spacing={4} sx={{ mb: 2 }}>
                {/* Book Image Column */}
                <Grid item xs={12} md={4}>
                    <Box
                        component="img"
                        src={selectedBook.src}
                        alt={selectedBook.title}
                        sx={{
                            width: '60%',
                            height: 'auto',
                            objectFit: 'cover',
                            border: '1px solid #ddd',
                        }}
                    />
                </Grid>

                {/* Book Info Column */}
                <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', gap: 1}}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        {selectedBook.title}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                        {selectedBook.writer}
                    </Typography>

                    <Divider
                        sx={{
                            borderBottom: '1px solid #ddd',
                            mb: 3,
                        }}
                    />

                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        스터디 설정
                    </Typography>
                    <TextField
                        fullWidth
                        size='small'
                        label="스터디 페이지 이름을 작성해주세요"
                        variant="outlined"
                        // sx={{ mb: 2 }}
                    />
                </Grid>
            </Grid>

            {/* Study Creation Form */}
            <Grid container spacing={4}>
                {/* Study Duration Column */}
                <Grid item xs={12} md={6} >
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        스터디 기간
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, }}>
                        <TextField
                            size="small"
                            type="date"
                            variant="outlined"
                            defaultValue={formatDate('2024-08-19')}
                            sx={{ width: '100%'}}
                        />
                        <Typography variant="h6">~</Typography>
                        <TextField
                            size="small"
                            type="date"
                            variant="outlined"
                            defaultValue={formatDate('2024-08-19')}
                            sx={{ width: '100%' }}
                        />
                    </Box>
                </Grid>

                {/* Study Schedule Column */}
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        스터디 요일 및 시간
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }} >
                        <Select fullWidth defaultValue="월요일" size="small">
                            <MenuItem value="월요일">월요일</MenuItem>
                            <MenuItem value="화요일">화요일</MenuItem>
                            <MenuItem value="수요일">수요일</MenuItem>
                            <MenuItem value="목요일">목요일</MenuItem>
                            <MenuItem value="금요일">금요일</MenuItem>
                            <MenuItem value="토요일">토요일</MenuItem>
                            <MenuItem value="일요일">일요일</MenuItem>
                        </Select>
                        <TextField type="time" defaultValue="14:00" fullWidth size="small" />
                    </Box>
                </Grid>

                {/* Study Introduction Column */}
                <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        스터디 페이지 개요
                    </Typography>
                    <TextField
                        fullWidth
                        multiline
                        rows={11}
                        variant="outlined"
                        placeholder="스터디 페이지를 소개하는 내용을 입력해주세요"
                    />
                </Grid>
            </Grid>

            {/* Action Buttons */}
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
                    생성
                </Button>
            </Box>
        </Box>
    );
};

export default StudyCreationPage;
