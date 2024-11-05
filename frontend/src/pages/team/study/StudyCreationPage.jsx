import React, { useState } from 'react';
import {
    Box,
    Button,
    Typography,
    TextField,
    Grid,
    FormControl,
    Select,
    MenuItem,
    Divider
} from '@mui/material';
import { useTheme } from '@mui/material';
import dayjs from 'dayjs';
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const StudyCreationPage = ({ onCancel, selectedBook }) => {
    const param = useParams();
    const theme = useTheme();

    const [formData, setFormData] = useState({
        studyPageName: "",
        startDate: "",
        endDate: "",
        description: "",
    });

    const [errorMessage, setErrorMessage] = useState("");
    const [reminds, setReminds] = useState([]);
    const userIds = ["", ""]; // 사용자 ID 배열
    const navigate = useNavigate(); // useNavigate 훅 사용
    const handleChange = (field, value) => {
        setFormData((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleRemindChange = (index, field, value) => {
        const updatedReminds = [...reminds];
        updatedReminds[index] = {
            ...updatedReminds[index],
            [field]: value,
        };
        setReminds(updatedReminds);
    };

    const handleAddRemind = () => {
        setReminds([...reminds, { dayType: "", timeAt: "", description: "" }]);
    };

    const handleSubmit = async (e) => {
        e.preventDefault(); // 폼 제출 이벤트 방지

    };

    const AlertDayOptions = [
        { label: "Monday", value: 0 },
        { label: "Tuesday", value: 1 },
        { label: "Wednesday", value: 2 },
        { label: "Thursday", value: 3 },
        { label: "Friday", value: 4 },
        { label: "Saturday", value: 5 },
        { label: "Sunday", value: 6 },
    ];

    return (
        <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
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
                        src={selectedBook.image}
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
                <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
                        value={formData.studyPageName}
                        onChange={(e) => handleChange("studyPageName", e.target.value)}
                        fullWidth
                        size='small'
                        label="스터디 페이지 이름을 작성해주세요"
                        variant="outlined"
                    />
                </Grid>
            </Grid>

            {/* Study Creation Form */}
            <Grid container spacing={4}>
                {/* Study Duration Column */}
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        스터디 기간
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, }}>
                        <TextField
                            value={formData.startDate}
                            onChange={(e) => handleChange("startDate", e.target.value)}
                            size="small"
                            type="date"
                            variant="outlined"
                            sx={{ width: '100%'}}
                        />
                        <Typography variant="h6">~</Typography>
                        <TextField
                            value={formData.endDate}
                            onChange={(e) => handleChange("endDate", e.target.value)}
                            size="small"
                            type="date"
                            variant="outlined"
                            sx={{ width: '100%' }}
                        />
                    </Box>
                </Grid>

                {/* Study Schedule Section */}
                <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        스터디 요일 및 시간
                    </Typography>
                    {reminds.map((remind, index) => (
                        <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                            <FormControl>
                                <Select
                                    size="small"
                                    value={remind.dayType}
                                    onChange={(e) => handleRemindChange(index, "dayType", e.target.value)}
                                    label="Date Type"
                                >
                                    {AlertDayOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                type="time"
                                defaultValue="14:00"
                                fullWidth
                                size="small"
                            />
                        </Box>
                    ))}
                    <Button onClick={handleAddRemind} variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
                        Add Reminder
                    </Button>
                </Grid>

                {/* Study Introduction Column */}
                <Grid item xs={12}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        스터디 페이지 개요
                    </Typography>
                    <TextField
                        value={formData.description}
                        onChange={(e) => handleChange("description", e.target.value)}
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
                <Button variant="contained" onClick={onCancel} sx={{ color: '#fff', backgroundColor: theme.palette.warning.main, px: 4 }}>
                    취소
                </Button>
                <Button type="submit" variant="contained" sx={{ backgroundColor: theme.palette.primary.main, color: '#fff', px: 4 }}>
                    생성
                </Button>
            </Box>
        </Box>
    );
};

export default StudyCreationPage;
