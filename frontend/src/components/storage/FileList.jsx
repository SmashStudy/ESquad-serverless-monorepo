import React from 'react';
import {
  List,
  ListItem,
  Box,
  Typography,
  IconButton,
  ListItemIcon
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import PropTypes from 'prop-types';

const FileList = ({
  files,
  email,
  onFileDownload,
  onFileDelete,
  formatFileSize
}) => {
  return (
      <List>
        {files && files.length > 0 ? (
            files.map((file) => (
                <ListItem
                    key={file.fileKey}
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      width: '100%',
                      flexWrap: 'wrap',
                      padding: 2,
                      borderBottom: '1px solid #ddd',
                    }}
                >
                  <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                      }}
                  >
                    <Box sx={{display: 'flex', alignItems: 'center'}}>
                      <ListItemIcon>
                        <AttachFileIcon/>
                      </ListItemIcon>
                      <Typography
                          variant="body1"
                          color="textPrimary"
                          sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '600px',
                          }}
                      >
                        {file.originalFileName}
                      </Typography>
                    </Box>
                  </Box>

                  <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        mt: 1,
                      }}
                  >
                    <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          flexWrap: 'wrap',
                          gap: 2,
                        }}
                    >
                      <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <Typography variant="body2" color="textSecondary"
                                    sx={{mr: 1}}>
                          파일 유형:
                        </Typography>
                        <Typography variant="body2" color="textPrimary">
                          {file.extension}
                        </Typography>
                      </Box>
                      <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <Typography variant="body2" color="textSecondary"
                                    sx={{mr: 1}}>
                          업로더:
                        </Typography>
                        <Typography variant="body2" color="textPrimary">
                          {file.nickname}
                        </Typography>
                      </Box>
                      <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <Typography variant="body2" color="textSecondary"
                                    sx={{mr: 1}}>
                          게시일:
                        </Typography>
                        <Typography variant="body2" color="textPrimary">
                          {file.createdAt}
                        </Typography>
                      </Box>
                      <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <Typography variant="body2" color="textSecondary"
                                    sx={{mr: 1}}>
                          파일 크기:
                        </Typography>
                        <Typography variant="body2" color="textPrimary">
                          {formatFileSize(file.fileSize)}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{display: 'flex', gap: 1}}>
                      <IconButton
                          edge="end"
                          aria-label="download"
                          onClick={() => onFileDownload(file.fileKey,
                              file.originalFileName)}
                      >
                        <DownloadIcon/>
                      </IconButton>
                      {file.userEmail === email && (
                          <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() => onFileDelete(file.fileKey, file.userEmail)}
                              sx={{ display: file.userEmail === email ? 'block' : 'none' }}
                          >
                            <DeleteIcon/>
                          </IconButton>
                      )}
                    </Box>
                  </Box>
                </ListItem>
            ))
        ) : (
            <Typography variant="body2" color="textSecondary">
              첨부파일이 없습니다.
            </Typography>
        )}
      </List>
  );
};

FileList.propTypes = {
  files: PropTypes.arrayOf(
      PropTypes.shape({
        fileKey: PropTypes.string.isRequired,
        originalFileName: PropTypes.string.isRequired,
        extension: PropTypes.string.isRequired,
        nickname: PropTypes.string.isRequired,
        createdAt: PropTypes.string.isRequired,
        fileSize: PropTypes.number.isRequired,
        userEmail: PropTypes.string.isRequired,
      })
  ).isRequired,
  email: PropTypes.string.isRequired,
  onFileDownload: PropTypes.func.isRequired,
  onFileDelete: PropTypes.func.isRequired,
  formatFileSize: PropTypes.func.isRequired,
};

export default FileList;
