import React from 'react';
import {
  Box,
  Button,
  Typography,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import PropTypes from 'prop-types';

const FileUploader = ({
  selectedFile,
  onFileChange,
  onFileUpload,
  isUploading
}) => {
  return (
      <Box sx={{mb: 2, display: 'flex', gap: 2, alignItems: 'center'}}>
        <Button variant="contained" component="label" color="primary"
                startIcon={<UploadFileIcon/>}>
          파일 추가
          <input type="file" hidden onChange={onFileChange}/>
        </Button>
        {selectedFile && (
            <Box
                sx={{
                  mb: 2,
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 2,
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
            >
              <Typography variant="body2" color="textSecondary">
                선택한 파일:
              </Typography>
              <ListItem>
                <ListItemIcon>
                  <AttachFileIcon/>
                </ListItemIcon>
                <ListItemText primary={selectedFile.name}/>
              </ListItem>
              <Button
                  variant="contained"
                  color="secondary"
                  onClick={onFileUpload}
                  disabled={isUploading}
              >
                {isUploading ? '업로드 중...' : '등록'}
              </Button>
            </Box>
        )}
      </Box>
  );
};

FileUploader.propTypes = {
  selectedFile: PropTypes.object,
  onFileChange: PropTypes.func.isRequired,
  onFileUpload: PropTypes.func.isRequired,
  isUploading: PropTypes.bool.isRequired,
};

export default FileUploader;
