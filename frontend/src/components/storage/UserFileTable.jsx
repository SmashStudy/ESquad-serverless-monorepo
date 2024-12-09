import React from 'react';
import {AgGridReact} from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import {Box, Grid, IconButton} from "@mui/material";
import {formatFileSize} from "../../utils/fileFormatUtils.js";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  handleFileDelete,
  handleFileDownload
} from "../../utils/storage/utilities.js";
import Tooltip from "@mui/material/Tooltip";

const UserFileTable = ({gridData, setSnackbar, fetchData, theme}) => {
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

  ];

  return (
      <Grid item xs={10}>
        <Box sx={{height: '100%'}}>
          <div className="ag-theme-alpine"
               style={{width: '100%'}}>
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
  );
};

export default UserFileTable;
