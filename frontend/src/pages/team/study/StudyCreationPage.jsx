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
    Snackbar,
    IconButton,
    List,
    ListItem,
} from '@mui/material';
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import RestartAltIcon from "@mui/icons-material/RestartAlt";

const StudyPeriod = ({ formData, setFormData }) => {
    const handleChange = (field, value) => {
        if (field === "startDate" && value) {
            setFormData((prev) => ({
                ...prev,
                startDate: value,
                endDate: prev.endDate && value.isAfter(prev.endDate) ? value : prev.endDate,
            }));
        } else if (field === "endDate" && value) {
            setFormData((prev) => ({
                ...prev,
                endDate: value.isBefore(prev.startDate) ? prev.startDate : value,
            }));
        }
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ mb: 2 }}>
                스터디 기간
            </Typography>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <DatePicker
                    label="시작 날짜"
                    value={formData.startDate}
                    onChange={(newValue) => handleChange("startDate", newValue)}
                    minDate={dayjs().add(1, "day")}
                    renderInput={(params) => <TextField {...params} size="small" sx={{ width: "100%" }} />}
                />
                <Typography variant="h6">~</Typography>
                <DatePicker
                    label="종료 날짜"
                    value={formData.endDate}
                    onChange={(newValue) => handleChange("endDate", newValue)}
                    minDate={formData.startDate}
                    renderInput={(params) => <TextField {...params} size="small" sx={{ width: "100%" }} />}
                />
            </Box>
        </LocalizationProvider>
    );
};

const AlertDayOptions = [
    { label: "월요일", value: 0 },
    { label: "화요일", value: 1 },
    { label: "수요일", value: 2 },
    { label: "목요일", value: 3 },
    { label: "금요일", value: 4 },
    { label: "토요일", value: 5 },
    { label: "일요일", value: 6 },
];

const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
        for (let min = 0; min < 60; min += 15) {
            const time = `${hour.toString().padStart(2, "0")}:${min
                .toString()
                .padStart(2, "0")}`;
            options.push(time);
        }
    }
    return options;
};

const timeOptions = generateTimeOptions();

const StudySchedule = ({
                           reminds,
                           setReminds,
                           handleAddRemind,
                           handleRemindChange,
                           handleResetRemind,
                           handleDeleteRemind,
                        }) => {

    const getUnavailableTimes = (dayType, isStartTime) => {
        const unavailableTimes = new Set();

        reminds
            .filter((remind) => remind.dayType === dayType) // Filter reminders with the same day
            .forEach(({ startTime, endTime }) => {
                const startIndex = timeOptions.indexOf(startTime);
                const endIndex = timeOptions.indexOf(endTime);
                for (let i = startIndex; i <= endIndex; i++) {
                    unavailableTimes.add(timeOptions[i]);
                }
            });
        return unavailableTimes;
    };

    const getEndTimeOptions = (rowIndex, dayType, startTime) => {
        if (!startTime) return [];  // 시작 시간이 선택되지 않은 경우 빈 배열 반환

        // 같은 요일(dayType)의 기존 알림 필터링 (현재 행 제외)
        const sameDayReminds = reminds.filter(
            (remind, index) => remind.dayType === dayType && index !== rowIndex
        );

        // 같은 요일의 알림에서 모든 startTime 및 endTime 인덱스 가져오기
        const startTimeIndices = sameDayReminds
            .map((remind) => timeOptions.indexOf(remind.startTime))
            .filter((index) => index >= 0); // 유효한 인덱스만 필터링
        const endTimeIndices = sameDayReminds
            .map((remind) => timeOptions.indexOf(remind.endTime))
            .filter((index) => index >= 0); // 유효한 인덱스만 필터링

        const earliestStartTimeIndex = Math.min(...startTimeIndices, Infinity);  // 가장 빠른 startTime의 인덱스
        const latestStartTimeIndex = Math.max(...startTimeIndices, -Infinity);   // 가장 늦은 startTime의 인덱스
        const earliestEndTimeIndex = Math.min(...endTimeIndices, Infinity);      // 가장 빠른 endTime의 인덱스
        const latestEndTimeIndex = Math.max(...endTimeIndices, -Infinity);      // 가장 빠른 endTime의 인덱스

        const currentStartTimeIndex = timeOptions.indexOf(startTime);           // 현재 행의 startTime 인덱스

        if (currentStartTimeIndex > latestEndTimeIndex) {
            // 현재 startTime이 가장 늦은 경우, 현재 startTime 이후의 시간만 선택 가능
            return timeOptions.slice(currentStartTimeIndex + 1);
        } else if (currentStartTimeIndex < latestStartTimeIndex) {
            // 그 외의 경우, 현재 startTime 이후의 시간만 선택 가능
            // 가장 가까운 endTime 찾기
            const nearestStartTimeIndex = startTimeIndices
                .filter((startIndex) => startIndex > currentStartTimeIndex) // 현재 startTime 이후의 startTime 만 필터링
                .sort((a, b) => a - b)[0]; // 가장 가까운 startTime 선택
            // 가장 가까운 endTime 이전까지만 허용
            return timeOptions.filter(
                (time, index) => index > currentStartTimeIndex && index < nearestStartTimeIndex
            );
        } else if (currentStartTimeIndex < earliestStartTimeIndex) {
            // 현재 startTime이 가장 빠른 경우, earliestStartTimeIndex 이전 시간도 선택 가능
            return timeOptions.filter(
                (time, index) =>
                    index > currentStartTimeIndex && // 현재 startTime 이후
                    index < earliestStartTimeIndex // 가장 빠른 startTime 이전까지
            );
        }
    }

    return (
        <Box>
            <Box
                sx={{
                    display: "flex",
                    gap: 5,
                    alignItems: "center",
                    justifyContent: "flex-center",
                }}
            >
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    스터디 요일 및 시간
                </Typography>
                <IconButton
                    onClick={handleAddRemind}
                    color="primary"
                    sx={{
                        transition: "transform 0.2s",
                        "&:hover": {
                            transform: "scale(1.2)",
                        },
                    }}
                >
                    <AddIcon />
                </IconButton>
            </Box>
            <Box sx={{ height: "25vh", overflowY: "auto"}}>
                <List>
                    {reminds.map((remind, index) => {
                        const endTimeOptions = getEndTimeOptions(
                            index,
                            remind.dayType,
                            remind.startTime
                        );

                        return (
                            <ListItem
                                key={index}
                                sx={{ display: "flex", gap: 3, alignItems: "center", pl: 0, pt: 0, pb: 2 }}
                            >
                                <FormControl sx={{ minWidth: 120 }}>
                                    <Select
                                        size="small"
                                        value={remind.dayType}
                                        onChange={(e) =>
                                            handleRemindChange(index, "dayType", e.target.value)
                                        }
                                        displayEmpty
                                    >
                                        <MenuItem value="">요일 선택</MenuItem>
                                        {AlertDayOptions.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl sx={{ minWidth: 100 }}>
                                    <Select
                                        size="small"
                                        value={remind.startTime}
                                        onChange={(e) =>
                                            handleRemindChange(index, "startTime", e.target.value)
                                        }
                                        sx={{ width: '120px' }}
                                        displayEmpty
                                        disabled={remind.dayType === null || remind.dayType === undefined || remind.dayType === '' } // Disable if no dayType is selected
                                    >
                                        <MenuItem value="" size="middle">시작 시간</MenuItem>
                                        {timeOptions.map((time) => (
                                            <MenuItem
                                                key={time}
                                                value={time}
                                                disabled={getUnavailableTimes(remind.dayType, true).has(
                                                    time
                                                )}
                                            >
                                                {time}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <FormControl sx={{ minWidth: 100 }}>
                                    <Select
                                        size="small"
                                        value={remind.endTime}
                                        onChange={(e) =>
                                            handleRemindChange(index, "endTime", e.target.value)
                                        }
                                        sx={{ width: '120px' }}
                                        displayEmpty
                                        disabled={remind.dayType === null || remind.dayType === undefined || remind.dayType === '' || !remind.startTime}
                                    >
                                        <MenuItem value="">종료 시간</MenuItem>
                                        {endTimeOptions.map((time) => (
                                            <MenuItem key={time} value={time}>
                                                {time}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <IconButton
                                    onClick={() => handleResetRemind(index)}
                                    color="info"
                                    sx={{
                                        transition: "transform 0.2s",
                                        "&:hover": { transform: "scale(1.2)" },
                                    }}
                                >
                                    <RestartAltIcon />
                                </IconButton>
                                <IconButton
                                    onClick={() => handleDeleteRemind(index)}
                                    color="error"
                                    sx={{
                                        transition: "transform 0.2s",
                                        "&:hover": { transform: "scale(1.2)" },
                                    }}
                                >
                                    <DeleteIcon />
                                </IconButton>
                        </ListItem>
                        );
                    })}
                </List>
            </Box>
        </Box>
    );
};

const StudyCreationPage = ({ onCancel, selectedBook }) => {
    const navigate = useNavigate(); 
    const theme = useTheme();
    const {teamId} = useParams();

    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState("");
    const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // "success" or "error"
    const [formData, setFormData] = useState({
        studyName: "",
        startDate: dayjs().add(1, "day"),
        endDate: dayjs().add(2, "day"),
        description: "",
    });
    const [reminds, setReminds] = useState([
        { dayType: "", startTime: "", endTime: "" },
    ]);

    const handleAddRemind = () => {
        const lastRemind = reminds[reminds.length - 1];
        if(lastRemind) {
            if (typeof lastRemind.dayType !== "number" || !lastRemind.startTime || !lastRemind.endTime) {
                setSnackbarMessage("요일, 시작 시간 및 종료 시간을 모두 입력해야 추가할 수 있습니다.");
                setSnackbarSeverity("error");
                setOpenSnackbar(true);
                return;
            }

            const isOverlapping = reminds.some((remind, index) => {
                if (index === reminds.length - 1) return false; // Skip the last one being checked
                return (
                    remind.dayType === lastRemind.dayType &&
                    !(
                        lastRemind.endTime <= remind.startTime || // Ends before another starts
                        lastRemind.startTime >= remind.endTime   // Starts after another ends
                    )
                );
            });

            if (isOverlapping) {
                setSnackbarMessage("해당 요일에 설정된 시간이 서로 겹칩니다. 다시 설정해주세요.");
                setSnackbarSeverity("error");
                setOpenSnackbar(true);
                return;
            }
        }

        setReminds([
            ...reminds,
            { dayType: "", startTime: "", endTime: "" },
        ]);
    };

    const handleRemindChange = (index, field, value) => {
        const updatedReminds = [...reminds];
        updatedReminds[index] = { ...updatedReminds[index], [field]: value };
        setReminds(updatedReminds);
    };

    const handleResetRemind = (index) => {
        setReminds((prev) =>
            prev.map((remind, i) =>
                i === index ? { dayType: "", startTime: "", endTime: "" } : remind
            )
        );
    }

    const handleDeleteRemind = (index) => {
        if(index === 0 ) {
            setSnackbarMessage("적어도 한 시간 이상은 공부 계획을 설정해주세요!");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
            return;
        }
        const updatedReminds = reminds.filter((_, i) => i !== index);
        setReminds(updatedReminds.length > 0 ? updatedReminds : []); // Reset state to avoid empty list issues
    };

    const handleChange = (field, value) => {
        setFormData((prevState) => ({
            ...prevState,
            [field]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.studyName.trim()) {
            setSnackbarMessage("스터디 이름을 작성해주세요.");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
            return;
        }
        if (!formData.startDate || !formData.endDate) {
            setSnackbarMessage("스터디 기간을 올바르게 설정해주세요.");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
            return;
        }
        if (!dayjs(formData.startDate).isValid() || !dayjs(formData.endDate).isValid()) {
            setSnackbarMessage("유효한 날짜를 선택해주세요.");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
            return;
        }
        if (dayjs(formData.startDate).isAfter(formData.endDate)) {
            setSnackbarMessage("시작 날짜는 종료 날짜보다 빨라야 합니다.");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
            return;
        }

        const hasInvalidSchedule = reminds.some((remind) => {
            return (
                remind.dayType === "" ||
                remind.startTime === "" ||
                remind.endTime === "" ||
                !(remind.dayType) ||
                !(remind.startTime)  ||
                !(remind.endTime)
            );
        });

        if (hasInvalidSchedule) {
            setSnackbarMessage("요일, 시작 시간, 종료 시간을 모두 설정해주세요.");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
            return;
        }

        const hasOverlappingSchedules = reminds.some((remind1, index1) =>
            reminds.some((remind2, index2) => {
                if (index1 === index2) return false;
                return (
                    remind1.dayType === remind2.dayType &&
                    !(remind1.endTime <= remind2.startTime || remind1.startTime >= remind2.endTime)
                );
            })
        );

        if (hasOverlappingSchedules) {
            setSnackbarMessage("시간이 겹치는 일정이 있습니다. 다시 확인해주세요.");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
            return;
        }
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
            setSnackbarSeverity("success");
            setOpenSnackbar(true);
            setTimeout(() => {
                navigate(`/teams/${encodeURIComponent(teamId)}/study`);
            }, 2000);
        } catch (error) {
            setSnackbarMessage("스터디 생성에 실패했습니다. 잠시 후 다시 시도해주세요");
            setSnackbarSeverity("error");
            setOpenSnackbar(true);
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
                        label="스터디 이름을 작성해주세요"
                        variant="outlined"
                    />
                </Grid2>
            </Grid2>

            {/* Study Creation Form */}
            <Grid2 container spacing={4}>
                {/* Study Duration Column */}
                <Grid2>
                    <StudyPeriod formData={formData} setFormData={setFormData} />
                </Grid2>

                {/* Study Schedule Section */}
                <Grid2>
                    <StudySchedule
                        reminds={reminds}
                        setReminds={setReminds}
                        handleAddRemind={handleAddRemind}
                        handleRemindChange={handleRemindChange}
                        handleResetRemind={handleResetRemind}
                        handleDeleteRemind={handleDeleteRemind}
                    />
                </Grid2>

                {/* Study Introduction Column */}
                <Box sx={{ maxHeight: "40vh", width: "100%", pr: 2 }}>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        스터디 페이지 개요
                    </Typography>
                    <TextField
                        value={formData.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        fullWidth
                        multiline
                        rows={10}
                        variant="outlined"
                        placeholder="- 어떤 목적의 스터디인가요??!"
                    />
                </Box>
            </Grid2>

            {/* Action Buttons */}
            <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    mt: 3,
                    pb: 3,
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
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: "top", horizontal: "center" }} // 중앙에 위치
                sx={{
                    top: '50%',
                    transform: 'translateY(-50%)',
                    display: 'flex',
                    justifyContent: 'center',
                }}
            >
                <Alert
                    onClose={() => setOpenSnackbar(false)}
                    severity={snackbarSeverity}
                    sx={{
                        width: '100%',
                        backgroundColor: snackbarSeverity === "success" ? "green" : "red",
                        color: '#fff',
                    }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>

        </Box>
    );
};

export default StudyCreationPage;