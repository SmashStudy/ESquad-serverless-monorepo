import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Typography, Card, CardContent, Grid } from '@mui/material';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import * as echarts from 'echarts';
import Layout from './Layout';
import useUserEmail from "../../hooks/user/UseUserEmail.jsx";
import { formatFileSize } from "../../utils/fileFormatUtils.js";
import { getStorageApi } from "../../utils/apiConfig.js";

const UserStorageUsageRenewed = () => {
  const [gridData, setGridData] = useState([]);
  const { email, error: emailError } = useUserEmail();
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState(0);
  const [usageError, setUsageError] = useState(null);

  useEffect(() => {
    // 데이터를 불러오는 함수
    const fetchData = async () => {
      setLoading(true);
      try {
        // API 호출을 통해 유저 사용량 및 파일 목록 받아오기
        const response = await axios.get(`${getStorageApi()}/get-user-usage`, {
          params: { userEmail: email },
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

    if (email) {
      fetchData();
    }
  }, [email]);

  useEffect(() => {
    // eChart 게이지 차트 설정
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
                color: usagePercent < 30 ? '#63869e' : usagePercent < 60 ? '#f6d05f' : '#e26a6a'
              }
            },
            detail: { valueAnimation: true, formatter: '{value}%', fontSize: 20 },
            data: [{ value: usagePercent.toFixed(2), name: '사용량' }],
            animationDuration: 1000, // 애니메이션 지속 시간 설정
            animationEasing: 'circularOut'
          },
        ],
      };

      myChart.setOption(option);
    }
  }, [usage]);

  const columnDefs = [
    { headerName: '파일 이름', field: 'originalFileName', sortable: true, filter: true },
    { headerName: '다운로드 수', field: 'downloadCount', sortable: true, filter: true },
    { headerName: '파일 크기', field: 'fileSize', sortable: true, filter: true, valueFormatter: ({ value }) => formatFileSize(value) },
    { headerName: '올린 시간', field: 'createdAt', sortable: true, filter: true },
    { headerName: '확장자', field: 'extension', sortable: true, filter: true },
  ];

  return (
      <Layout>
        <Box sx={{ padding: 1 }}>
          {/* 상단 타이틀 */}
          <Typography variant="h4" sx={{ marginBottom: 5 }}>
            스토리지 사용량 통계
          </Typography>

          {/* 전체 레이아웃 그리드 */}
          <Grid container spacing={3}>
            {/* 좌측 - AG Grid 테이블 */}
            <Grid item xs={8}>
              <Box sx={{ height: '100%' }}>
                <div className="ag-theme-alpine" style={{ height: '500px', width: '100%' }}>
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
              <Box sx={{ height: '300px', marginBottom: 2 }}>
                <Box id="usageGauge" sx={{ height: '100%' }} />
              </Box>

              {/* 우측 하단 - 요약 정보 카드 */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>총 용량: 5GB</Typography>
                  {loading ? (
                      <Typography variant="body1">Loading...</Typography>
                  ) : usageError || emailError ? (
                      <Typography variant="body1" color="error">
                        Error: {usageError?.message || emailError?.message}
                      </Typography>
                  ) : (
                      <>
                        <Typography variant="body1">사용량: {formatFileSize(usage)}</Typography>
                        <Typography variant="body1">남은 용량: {formatFileSize(5 * 1024 * 1024 * 1024 - usage)}</Typography>
                        <Box sx={{ marginTop: 2 }}>
                          <Typography variant="body2">남은 용량 상태:</Typography>
                          <Box sx={{ width: '100%', bgcolor: '#f3f3f3' }}>
                            <Box
                                sx={{
                                  width: `${(usage / (5 * 1024 * 1024 * 1024)) * 100}%`,
                                  bgcolor: '#76c7c0',
                                  height: 10,
                                }}
                            />
                          </Box>
                        </Box>
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
