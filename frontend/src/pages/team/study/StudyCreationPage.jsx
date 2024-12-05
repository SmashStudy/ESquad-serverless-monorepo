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
import { createStudy } from '../../../utils/team/studyApi.js';
const AlertDayOptions = [
    { label: "Monday", value: 0 },
    { label: "Tuesday", value: 1 },
    { label: "Wednesday", value: 2 },
    { label: "Thursday", value: 3 },
    { label: "Friday", value: 4 },
    { label: "Saturday", value: 5 },
    { label: "Sunday", value: 6 },
];
const StudyCreationPage = ({ onCancel, selectedBook , selectedTeamId}) => {   
    const [loading, setLoading] = useState(false);
    //studyName으로 추후 변경
    const [formData, setFormData] = useState({
        name: "",
        startDate: "",
        endDate: "",
        description: "",
    });
    const teamId ="TEAM%230878b2df-9c94-46fb-b32c-2cab673cee90";    

    //팀 유저 중 택 1
    const userIds =  ["afeirhl223@gmail.com", "dbeb@naver.com"];
    
    const [errorMessage, setErrorMessage] = useState("");
    const [reminds, setReminds] = useState([]);
    const navigate = useNavigate();
    const theme = useTheme();
    const param = useParams();

    const  handleChange = (field, value) => {
        setFormData((prevState) => ({ ...prevState, [field]: value }));
    };

    const handleRemindChange = (index, field, value) => {
        const updatedReminds = [...reminds];
        updatedReminds[index] = { ...updatedReminds[index], [field]: value };
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
        setLoading(true);
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
                studyUserIds: userIds,
            };
            
            console.log(`${JSON.stringify(bookDto)}`);
            console.log(`${JSON.stringify(studyData)}`);

            const response = await createStudy(teamId, bookDto, studyData);
            const { PK } = response.data || {};
            if (!PK) throw new Error("스터디 생성에 실패했습니다.");
            navigate(`/teams/${teamId}/study/${PK}`);
        } catch (error) {
            console.error("Error creating study:", error.message);
            setErrorMessage(error.response?.data?.message||"스터디를 생성할 수 없습니다. 다시 시도해주세요.");
        } finally {
            setLoading(false);
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
            <Grid container spacing={4} sx={{ mb: 2 }}>
                {/* Book Image Column */}
                <Grid item xs={12} md={4}>
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
                </Grid>

                {/* Book Info Column */}
                <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <Typography variant="h5" fontWeight="bold" gutterBottom>
                        {selectedBook.maintitle}
                    </Typography>
                    <Typography variant="authors" color="textSecondary" gutterBottom>
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
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
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
                <Button type="submit" onClick={onCreate} variant="contained" sx={{ backgroundColor: theme.palette.primary.main, color: '#fff', px: 4 }}>
                    생성
                </Button>
            </Box>
        </Box>
    );
};

export default StudyCreationPage;
