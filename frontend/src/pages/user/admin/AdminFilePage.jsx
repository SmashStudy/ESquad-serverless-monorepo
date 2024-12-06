import React, {useEffect, useState} from "react";
import {
  Typography,
  Box,
  Container,
  CircularProgress,
  TextField,
  IconButton,
  Tooltip,
  Button,
  TableContainer,
  Paper,
  Table,
  TableHead, TableRow, TableCell, TableBody, Chip, Grid, useTheme
} from "@mui/material";
import {getStorageApi, getUserApi} from "../../../utils/apiConfig.js";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import SortIcon from "@mui/icons-material/Sort";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import {
  handleFileDelete,
  handleFileDownload
} from "../../../utils/storage/utilities.js";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import {formatFileSize} from "../../../utils/fileFormatUtils.js";
import axios from "axios";
import {AgGridReact} from "ag-grid-react";

const AdminFilePage = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  useEffect(() => {
    fetchFiles();
  }, []);

  const columnDefs = [
    {
      headerName: '작업',
      field: 'actions',
      cellStyle: { display: 'flex', justifyContent: 'center', alignItems: 'center' }, // 버튼 가운데 정렬
      cellRenderer: (params) => {
        const { fileKey, originalFileName, userEmail } = params.data;
        return (
            <Box sx={{ display: 'flex', gap: 1 }}> {/* 버튼 간격 조정 */}
              <Tooltip title="다운로드">
                <IconButton
                    aria-label="download"
                    size="small"
                    onClick={() => handleFileDownload(fileKey, originalFileName, setSnackbar)}
                    sx={{ color: theme.palette.success.main }}
                >
                  <DownloadIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="삭제">
                <IconButton
                    aria-label="delete"
                    size="small"
                    onClick={() => handleFileDelete(fileKey, userEmail, userEmail, setSnackbar, fetchData)}
                    sx={{ color: theme.palette.warning.main }}
                >
                  <DeleteIcon />
                </IconButton>
              </Tooltip>
            </Box>
        );
      }
    },
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
      headerName: '업로더',
      field: 'userEmail',
      sortable: true,
      filter: true
    },
    {
      headerName: '유저 닉네임',
      field: 'userNickname',
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
      headerName: '콘텐츠 유형',
      field: 'contentType',
      sortable: true,
      filter: true
    },
    {
      headerName: '파일 PK',
      field: 'fileKey',
      sortable: true,
      filter: true
    }

  ];




  const fetchFiles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${getStorageApi()}/admin/metadata`);

      const data = await response.data;
      setFiles(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
  };


  if (loading) {
    return (
        <Container style={{ textAlign: "center", marginTop: "20%" }}>
          <CircularProgress style={{ marginBottom: "20px" }} />
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
                rowData={files}
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

export default AdminFilePage;
