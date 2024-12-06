import React from 'react';
import { AgGridReact } from 'ag-grid-react';
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

const UserFileTable = ({ gridData, setSnackbar, fetchData, theme }) => {
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
  );
};

export default UserFileTable;
