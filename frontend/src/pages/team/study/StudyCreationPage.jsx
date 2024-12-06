import React, { useState } from 'react';
import { useTheme } from '@mui/material';
import { useNavigate, useParams } from "react-router-dom";
import { createStudy } from '../../../utils/team/studyApi.js';
import {
    Box,
    Button,
    Typography,
    TextField,
    Grid2,
    FormControl,
    Select,
    MenuItem,
    Divider,
    Alert,
    Snackbar
} from '@mui/material';

const AlertDayOptions = [
    { label: "Monday", value: 0 },
    { label: "Tuesday", value: 1 },
    { label: "Wednesday", value: 2 },
    { label: "Thursday", value: 3 },
    { label: "Friday", value: 4 },
    { label: "Saturday", value: 5 },
    { label: "Sunday", value: 6 },
];

const StudyCreationPage = ({ onCancel, selectedBook }) => {
    const navigate = useNavigate(); 
    const theme = useTheme();
    
    const { teamId } = useParams();

    const [reminds, setReminds] = useState([]);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [formData, setFormData] = useState({
        studyName: "",
        startDate: "",
        endDate: "",
        description: "",
    });

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
        e.preventDefault();
        await onCreate();
    };

    const onCreate = async () => {
        try {
            const bookDto = {
                isbn: selectedBook.isbn,
                title: selectedBook.maintitle,
                authors: selectedBook.authors,
                publisher: selectedBook.publisher,
                publishedDate: selectedBook.publishedDate,
                imgPath: selectedBook.imgPath
            };
            const studyData = { 
                studyInfo: formData,
            };
            const response = await createStudy(encodeURIComponent(teamId), bookDto, studyData);
            const { PK } = response.body || {};
            if (!PK) throw new Error("스터디 생성에 실패했습니다.");

            setSnackbarMessage("스터디가 성공적으로 생성되었습니다.");
            setOpenSnackbar(true);
            setTimeout(() => {
                navigate('/');
                window.location.reload();
            }, 2000);

        } catch (error) {
            console.error("Error creating study:", error.message);
        }
    };

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
            <Grid2 container spacing={4} sx={{ mb: 2 }}>
                {/* Book Image Column */}
                <Grid2 item xs={12} md={4}>
                    <Box
                        component="img"
                        src={selectedBook.imgPath}
                        alt={selectedBook.maintitle}
                        sx={{
                            width: '60%',
                            height: 'auto',
                            objectFit: 'cover',
                            border: '1px solid #ddd',
                        }}
                    />
                </Grid2>

                {/* Book Info Column */}
                <Grid2 item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        {selectedBook.maintitle}
                    </Typography>
                    <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                        {selectedBook.authors}
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
                        value={formData.studyName}
                        onChange={(e) => handleChange("studyName", e.target.value)}
                        fullWidth
                        size='small'
                        label="스터디 페이지 이름을 작성해주세요"
                        variant="outlined"
                    />
                </Grid2>
            </Grid2>

            {/* Study Creation Form */}
            <Grid2 container spacing={4}>
                {/* Study Duration Column */}
                <Grid2 item xs={12} md={6}>
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
                            sx={{ width: '100%' }}
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
                </Grid2>

                {/* Study Schedule Section */}
                <Grid2 item xs={12} md={6}>
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
                </Grid2>

                {/* Study Introduction Column */}
                <Grid2 item xs={12}>
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
                </Grid2>
            </Grid2>

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

            {/* Snackbar */}
            <Snackbar
                open={openSnackbar}
                autoHideDuration={6000}
                onClose={() => setOpenSnackbar(false)}
            >
                <Alert onClose={() => setOpenSnackbar(false)} severity="success" sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>

        </Box>
    );
};

export default StudyCreationPage;