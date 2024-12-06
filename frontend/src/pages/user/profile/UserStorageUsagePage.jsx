import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton, useTheme, Tabs, Tab
} from '@mui/material';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import * as echarts from 'echarts';
import Layout from './UserProfileLayout.jsx';
import useUserEmail from "../../../hooks/user/UseUserEmail.jsx";
import {formatFileSize} from "../../../utils/fileFormatUtils.js";
import {getStorageApi} from "../../../utils/apiConfig.js";
import SnackbarAlert from "../../../components/storage/SnackBarAlert.jsx";
import UserFileTable from "../../../components/storage/UserFileTable.jsx";
import DownloadLogsTable
  from "../../../components/storage/UserDownloadLogsTable.jsx";
import DeleteLogsTable
  from "../../../components/storage/UserDeleteLogsTable.jsx";

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
  const [currentTab, setCurrentTab] = useState();
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

      console.log(fileData);
      console.log(deleteLogs);
    }
  }, [email]);

  useEffect(() => {
    const chartDom = document.getElementById('usageGauge');
    if (chartDom) {
      echarts.dispose(chartDom);

      const myChart = echarts.init(chartDom);
      const usagePercent = (usage / MAX_USAGE) * 100;
      const option = {
        series: [
          {
            type: 'gauge',
            progress: {
              show: true,
              width: 10,
              itemStyle: {
                color: usagePercent < 30 ? '#63869e' : usagePercent < 60
                    ? '#f6d05f' : '#e26a6a'
              }
            },
            detail: {valueAnimation: true, formatter: '{value}%', fontSize: 20},
            data: [{value: usagePercent.toFixed(2), name: '사용량'}],
            animationDuration: 1000, // 애니메이션 지속 시간 설정
            animationEasing: 'circularOut'
          },
        ],
      };

      myChart.setOption(option);
    }
  }, [usage]);

  const handleSnackbarClose = () => {
    setSnackbar({...snackbar, open: false});
  };

  return (
      <Layout>
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

            {/* 좌측 상단 - 게이지 차트 */}
            <Grid item xs={4}>
              <Box sx={{height: '300px'}}>
                <Box id="usageGauge" sx={{height: '100%'}}/>
              </Box>

              {/* 좌측 하단 - 요약 정보 카드 */}
              <Card sx={{
                padding: 2,
                marginTop: 3,
                backgroundColor: '#f9f9f9',
                boxShadow: 3
              }}>
                <CardContent>
                  <Typography variant="h6"
                              sx={{fontWeight: 'bold', marginBottom: 2}}>스토리지 요약
                    정보</Typography>
                  {loading ? (
                      <Typography variant="body1">Loading...</Typography>
                  ) : usageError || emailError ? (
                      <Typography variant="body1" color="error">
                        Error: {usageError?.message || emailError?.message}
                      </Typography>
                  ) : (
                      <>
                        <Typography variant="body2" sx={{marginBottom: 1}}>
                          <strong>총 파일 수:</strong> {fileData.length}
                        </Typography>
                        <Typography variant="body2" sx={{marginBottom: 1}}>
                          <strong>총 용량:</strong> 5GB
                        </Typography>
                        <Typography variant="body2" sx={{marginBottom: 1}}>
                          <strong>사용량:</strong> {formatFileSize(usage)}
                        </Typography>
                        <Typography variant="body2" sx={{marginBottom: 1}}>
                          <strong>남은 용량:</strong> {formatFileSize(
                            5 * 1024 * 1024 * 1024 - usage)}
                        </Typography>
                        {usage < 1.5 * 1024 * 1024 * 1024 ? (
                            <Typography variant="body2"
                                        sx={{color: 'green', marginTop: 1}}>
                              현재 용량 상태는 안정적입니다.
                            </Typography>
                        ) : usage < 4 * 1024 * 1024 * 1024 ? (
                            <Typography variant="body2"
                                        sx={{color: 'orange', marginTop: 1}}>
                              현재 용량 상태는 보통입니다.
                            </Typography>
                        ) : (
                            <Typography variant="body2"
                                        sx={{color: 'red', marginTop: 1}}>
                              현재 용량 상태는 포화 상태입니다. 파일을 삭제하거나 프리미엄 회원 구독하세요.
                            </Typography>
                        )
                        }

                      </>
                  )}
                </CardContent>
              </Card>
            </Grid>


            <Grid item xs={8}>
              <Tabs value={currentTab} onChange={handleTabChange} sx={{marginBottom: 3}}>
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

            {/*<Typography variant="h6" sx={{marginTop: 4}}>*/}
            {/*  파일 관리*/}
            {/*</Typography>*/}
            {/*<UserFileTable fetchData={fetchFileData} gridData={fileData}*/}
            {/*               setSnackbar={setSnackbar}*/}
            {/*               theme={theme}></UserFileTable>*/}
            {/*<Typography variant="h6" sx={{marginTop: 4}}>*/}
            {/*  다운로드 기록*/}
            {/*</Typography>*/}
            {/*<DownloadLogsTable gridData={downloadLogs}/>*/}

            {/*<Typography variant="h6" sx={{marginTop: 4}}>*/}
            {/*  삭제 기록*/}
            {/*</Typography>*/}
            {/*<DeleteLogsTable gridData={deleteLogs}/>*/}


          </Grid>
        </Box>
      </Layout>
  );
};

export default UserStorageUsageRenewed;
