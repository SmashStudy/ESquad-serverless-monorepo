import React, {useEffect, useState} from 'react';
import axios from 'axios';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  IconButton, useTheme
} from '@mui/material';
import {AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import * as echarts from 'echarts';
import Layout from './Layout';
import useUserEmail from "../../hooks/user/UseUserEmail.jsx";
import {formatFileSize} from "../../utils/fileFormatUtils.js";
import {getStorageApi} from "../../utils/apiConfig.js";
import {
  handleFileDelete,
  handleFileDownload
} from "../../utils/storage/utilities.js";
import SnackbarAlert from "../storage/SnackBarAlert.jsx";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";

const UserStorageUsageRenewed = () => {
  const [gridData, setGridData] = useState([]);
  const {email, error: emailError} = useUserEmail();
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState(0);
  const [usageError, setUsageError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const theme = useTheme();

    const fetchData = async () => {
      setLoading(true);
      try {
        // API 호출을 통해 유저 사용량 및 파일 목록 받아오기
        const response = await axios.get(`${getStorageApi()}/get-user-usage`, {
          params: {userEmail: email},
        });
        const files = response.data;

        // 파일 데이터 업데이트
        setGridData(files);

        // 사용량 계산: 모든 파일의 크기를 합산
        const totalUsage = files.reduce((sum, file) => sum + file.fileSize, 0);
        setUsage(totalUsage);
      } catch (error) {
        setUsageError(error);
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    if (email) {
      fetchData();
    }
  }, [email]);

  useEffect(() => {
    const chartDom = document.getElementById('usageGauge');
    if (chartDom) {
      echarts.dispose(chartDom);

      const myChart = echarts.init(chartDom);
      const MAX_USAGE = 5 * 1024 * 1024 * 1024; // 5GB
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

  const columnDefs = [
    {
      headerName: '파일 이름',
      field: 'originalFileName',
      sortable: true,
      filter: true
    },
    {
      headerName: '다운로드 수',
      field: 'downloadCount',
      sortable: true,
      filter: true
    },
    {
      headerName: '파일 크기',
      field: 'fileSize',
      sortable: true,
      filter: true,
      valueFormatter: ({value}) => formatFileSize(value)
    },
    {headerName: '올린 시간', field: 'createdAt', sortable: true, filter: true},
    {headerName: '확장자', field: 'extension', sortable: true, filter: true},
    {
      headerName: '작업',
      field: "작업",
      cellRenderer: (params) => {
        const {fileKey, originalFileName, userEmail} = params.data;
        return (
            <Box>
              <IconButton
                  aria-label="download"
                  variant="contained"
                  size="small"
                  onClick={() => handleFileDownload(fileKey,
                      originalFileName,setSnackbar)}
                  sx={{marginRight: 1, color:theme.palette.success.main}}
              >
                <DownloadIcon/>
              </IconButton>
              <IconButton
                  aria-label="delete"
                  variant="contained"
                  sx={{ color:theme.palette.warning.main}}
                  size="small"
                  onClick={() => handleFileDelete(fileKey, userEmail,
                      userEmail, setSnackbar, fetchData)}
              >
                <DeleteIcon/>
              </IconButton>
            </Box>
        )
      }
    }
  ];

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
            {/* 좌측 - AG Grid 테이블 */}
            <Grid item xs={8}>
              <Box sx={{height: '100%'}}>
                <div className="ag-theme-alpine"
                     style={{height: '500px', width: '100%'}}>
                  <AgGridReact
                      rowData={gridData}
                      columnDefs={columnDefs}
                      pagination={true}
                      paginationPageSize={10}
                      paginationPageSizeSelector={[10, 20, 50, 100]}
                      domLayout="autoHeight"
                  />
                </div>
              </Box>
            </Grid>

            {/* 우측 상단 - 게이지 차트 */}
            <Grid item xs={4}>
              <Box sx={{height: '300px'}}>
                <Box id="usageGauge" sx={{height: '100%'}}/>
              </Box>

              {/* 우측 하단 - 요약 정보 카드 */}
              <Card sx={{padding: 1, backgroundColor: '#f9f9f9', boxShadow: 3}}>
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
                          <strong>총 파일 수:</strong> {gridData.length}
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
          </Grid>
        </Box>
      </Layout>
  );
};

export default UserStorageUsageRenewed;
