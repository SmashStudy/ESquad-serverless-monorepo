import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Grid,
  useTheme, Tabs, Tab
} from '@mui/material';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import useUserEmail from "../../../hooks/user/UseUserEmail.jsx";
import {getStorageApi} from "../../../utils/apiConfig.js";
import SnackbarAlert from "../../../components/storage/SnackBarAlert.jsx";
import UserFileTable from "../../../components/storage/UserFileTable.jsx";
import DownloadLogsTable
  from "../../../components/storage/UserDownloadLogsTable.jsx";
import DeleteLogsTable
  from "../../../components/storage/UserDeleteLogsTable.jsx";
import UserUsageChart from "../../../components/storage/UserUsageChart.jsx";
import UserMaxUsage from "../../../components/storage/UserMaxUsage.jsx";

const UserStorageUsageRenewed = () => {
  const [fileData, setFileData] = useState([]);
  const [downloadLogs, setDownloadLogs] = useState([]);
  const [deleteLogs, setDeleteLogs] = useState([]);
  const {email, error: emailError} = useUserEmail();
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState(0);
  const [usageError, setUsageError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [currentTab, setCurrentTab] = useState(0);
  const theme = useTheme();
  const MAX_USAGE = 5 * 1024 * 1024 * 1024; // 5GB

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const fetchFileData = async () => {
    setLoading(true);
    try {
      // API 호출을 통해 유저 사용량 및 파일 목록 받아오기
      const response = await axios.get(`${getStorageApi()}/get-user-usage`, {
        params: {userEmail: email},
      });
      const files = response.data;

      // 파일 데이터 업데이트
      setFileData(files);

      // 사용량 계산: 모든 파일의 크기를 합산
      const totalUsage = files.reduce((sum, file) => sum + file.fileSize, 0);
      setUsage(totalUsage);
    } catch (error) {
      setUsageError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDownloadLogs = async () => {
    try {
      const response = await axios.post(
          `${getStorageApi()}/get-user-download-logs`, {
            userEmail: email,
          });
      setDownloadLogs(response.data);
    } catch (error) {
      console.error('Error fetching download logs:', error);
    }
  };

  const fetchDeleteLogs = async () => {
    try {
      const response = await axios.post(
          `${getStorageApi()}/get-user-delete-logs`, {
            uploaderEmail: email,
          });
      setDeleteLogs(response.data);
    } catch (error) {
      console.error('Error fetching delete logs:', error);
    }
  };

  useEffect(() => {
    if (email) {
      fetchFileData();
      fetchDownloadLogs();
      fetchDeleteLogs();

    }
  }, [email]);

  const handleSnackbarClose = () => {
    setSnackbar({...snackbar, open: false});
  };

  return (

      <Box sx={{padding: 1}}>
        <SnackbarAlert
            open={snackbar.open}
            message={snackbar.message}
            severity={snackbar.severity}
            onClose={handleSnackbarClose}
        />

        {/* 상단 타이틀 */}
        <Typography variant="h4" sx={{marginBottom: 5}}>
          스토리지 사용량 통계
        </Typography>

        {/* 전체 레이아웃 그리드 */}
        <Grid container spacing={3}>

          <Grid item xs={4}>
            <UserUsageChart usage={usage}
                            MAX_USAGE={MAX_USAGE}></UserUsageChart>

            <UserMaxUsage loading={loading} usageError={usageError}
                          emailError={emailError} fileData={fileData}
                          usage={usage} MAX_USAGE={MAX_USAGE}></UserMaxUsage>
          </Grid>

          <Grid item xs={8}>
            <Tabs value={currentTab} onChange={handleTabChange}
                  sx={{marginBottom: 3}}>
              <Tab label="파일 관리"></Tab>
              <Tab label="다운로드 기록"></Tab>
              <Tab label="삭제 기록"></Tab>
            </Tabs>

            {currentTab === 0 && (
                <UserFileTable fetchData={fetchFileData} gridData={fileData}
                               setSnackbar={setSnackbar}
                               theme={theme}></UserFileTable>
            )}
            {currentTab === 1 && (
                <DownloadLogsTable gridData={downloadLogs}/>
            )}

            {currentTab === 2 && (
                <DeleteLogsTable gridData={deleteLogs}/>
            )}
          </Grid>
        </Grid>
      </Box>

  );
};

export default UserStorageUsageRenewed;
