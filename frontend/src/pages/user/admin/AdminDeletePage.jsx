import React, {useEffect, useState} from "react";
import {
  Typography,
  Box,
  useTheme,
  Container, CircularProgress, Grid, Tooltip, IconButton
} from "@mui/material";
import {formatFileSize} from "../../../utils/fileFormatUtils.js";
import axios from "axios";
import {getStorageApi} from "../../../utils/apiConfig.js";
import {AgGridReact} from "ag-grid-react";
import {handleLogDelete} from "../../../utils/storage/utilities.js";
import DeleteIcon from "@mui/icons-material/Delete";

const AdminDeletePage = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    fetchLogs();
  }, []);

  const columnDefs = [
    {
      headerName: '작업',
      field: 'actions',
      cellStyle: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }, // 버튼 가운데 정렬
      cellRenderer: (params) => {
        const {logId} = params.data;
        return (
            <Box sx={{display: 'flex', gap: 1}}> {/* 버튼 간격 조정 */}
              <Tooltip title="삭제">
                <IconButton
                    aria-label="delete"
                    size="small"
                    onClick={() => handleLogDelete(logId, fetchLogs)}
                    sx={{color: theme.palette.warning.main}}
                >
                  <DeleteIcon/>
                </IconButton>
              </Tooltip>
            </Box>
        );
      }
    },
    {
      headerName: '로그 PK',
      field: 'logId',
      sortable: true,
      filter: true
    },
    {
      headerName: '이벤트 발생 시점',
      field: 'createdAt',
      sortable: true,
      filter: true
    },
    {
      headerName: '파일 키',
      field: 'fileKey',
      sortable: true,
      filter: true
    },
    {
      headerName: '접근 IP',
      field: 'ipAddress',
      sortable: true,
      filter: true
    },
    {
      headerName: '파일 이름',
      field: 'originalFileName',
      sortable: true,
      filter: true
    },
    {
      headerName: '타겟 PK',
      field: 'targetId',
      sortable: true,
      filter: true
    },
    {
      headerName: '타겟 유형',
      field: 'targetType',
      sortable: true,
      filter: true
    },
    {
      headerName: '생성한 유저',
      field: 'uploaderEmail',
      sortable: true,
      filter: true
    },
    {
      headerName: '유저 에이전트',
      field: 'userAgent',
      sortable: true,
      filter: true
    },
    {
      headerName: '접근한 유저',
      field: 'userEmail',
      sortable: true,
      filter: true
    },
    {headerName: '역할', field: 'userRole', sortable: true, filter: true},
    {
      headerName: '파일 크기',
      field: 'fileSize',
      sortable: true,
      filter: true,
      valueFormatter: ({value}) => formatFileSize(value)
    }
  ];

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${getStorageApi()}/admin/logs/DELETE`);

      const data = await response.data.items;
      setLogs(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
        <Container style={{textAlign: "center", marginTop: "20%"}}>
          <CircularProgress style={{marginBottom: "20px"}}/>
          <Typography variant="h6">파일 정보를 불러오는 중입니다...</Typography>
        </Container>
    );
  }

  return (
      <Grid item xs={10}>
        <Box sx={{height: '100%'}}>
          <div className="ag-theme-alpine"
               style={{width: '100%'}}>
            <AgGridReact
                rowData={logs}
                columnDefs={columnDefs}
                pagination={true}
                paginationPageSize={10}
                paginationPageSizeSelector={[10, 20, 50, 100]}
                domLayout="autoHeight"
            />
          </div>
        </Box>
      </Grid>
  );
};
export default AdminDeletePage;
