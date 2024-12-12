import React from 'react';
import {AgGridReact} from 'ag-grid-react';
import {formatFileSize} from "../../utils/fileFormatUtils.js";
import {Box, Grid} from "@mui/material";

const DownloadLogsTable = ({gridData}) => {
  const columnDefs = [
    {
      headerName: '파일 이름',
      field: 'originalFileName',
      sortable: true,
      filter: true
    },
    {headerName: '다운로드 시간', field: 'createdAt', sortable: true, filter: true},
    {
      headerName: '파일 크기',
      field: 'fileSize',
      sortable: true,
      filter: true,
      valueFormatter: ({value}) => formatFileSize(value)
    }
  ];

  return (
      <Grid item xs={10}>
        <Box sx={{height: '100%'}}>
          <div className="ag-theme-alpine"
               style={{width: '100%'}}>
            <AgGridReact rowData={gridData} columnDefs={columnDefs}
                         paginationPageSize={10}
                         paginationPageSizeSelector={[10, 20, 50, 100]}
                         domLayout="autoHeight"
                         pagination={true}/>
          </div>
        </Box>
      </Grid>
  );
};

export default DownloadLogsTable;
