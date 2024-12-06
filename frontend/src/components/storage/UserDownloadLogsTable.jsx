import React from 'react';
import {AgGridReact} from 'ag-grid-react';
import {formatFileSize} from "../../utils/fileFormatUtils.js";

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
      <div className="ag-theme-alpine" style={{height: '400px', width: '100%'}}>
        <AgGridReact rowData={gridData} columnDefs={columnDefs}
                     pagination={true}/>
      </div>
  );
};

export default DownloadLogsTable;
