import React, {memo, useState} from 'react';
import {
  List,
  ListItem,
  Box,
  Typography,
  IconButton,
  ListItemIcon, Dialog, DialogContent
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import PropTypes from 'prop-types';
import {formatFileSize} from "../../utils/fileFormatUtils.js";
import FilePreview from "./FilePreview.jsx";
import ImageIcon from '@mui/icons-material/Image';

const FileList = memo(({
  files,
  email,
  onFileDownload,
  onFileDelete,
  theme
}) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewFileKey, setPreviewFileKey] = useState(null); // 클릭된 파일 키 저장

  const handlePreviewOpen = (fileKey) => {
    setPreviewFileKey(fileKey);
    setIsPreviewOpen(true);
  };
  const handlePreviewClose = () => {
    setPreviewFileKey(null);
    setIsPreviewOpen(false);
  };
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
                      {file.contentType?.startsWith("image/") && (
                          <Typography
                              variant="body2"
                              color="primary"
                              sx={{
                                marginLeft: "8px",
                                cursor: "pointer",
                                marginTop: "4px"
                              }}
                              onClick={() => handlePreviewOpen(file.fileKey)}
                          >
                            <ImageIcon/>
                          </Typography>
                      )
                      }
                      {file.fileKey === previewFileKey && (
                          <Dialog open={isPreviewOpen}
                                  onClose={handlePreviewClose}>
                            <DialogContent>
                              <FilePreview
                                  fileKey={file.fileKey}
                              />
                            </DialogContent>
                          </Dialog>
                      )}
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
                          {file.userNickname}
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
                      <Box sx={{display: 'flex', alignItems: 'center'}}>
                        <Typography variant="body2" color="textSecondary"
                                    sx={{mr: 1}}>
                          다운로드 수:
                        </Typography>
                        <Typography variant="body2" color="textPrimary">
                          {file.downloadCount || "0"}
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{display: 'flex', gap: 1}}>
                      <Box>
                        <IconButton
                            edge="end"
                            aria-label="download"
                            sx={{color: theme.palette.success.main}}
                            onClick={() => onFileDownload(file.fileKey,
                                file.originalFileName)}
                        >
                          <DownloadIcon/>
                        </IconButton>
                      </Box>
                      <Box>
                        {file.userEmail === email && (
                            <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={() => onFileDelete(file.fileKey,
                                    file.userEmail)}
                                sx={{
                                  display: file.userEmail === email ? 'block'
                                      : 'none',
                                  color: theme.palette.warning.main
                                }}
                            >
                              <DeleteIcon/>
                            </IconButton>
                        )}
                      </Box>
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
});

FileList.propTypes = {
  files: PropTypes.arrayOf(
      PropTypes.shape({
        fileKey: PropTypes.string.isRequired,
        originalFileName: PropTypes.string.isRequired,
        extension: PropTypes.string.isRequired,
        userNickname: PropTypes.string.isRequired,
        createdAt: PropTypes.string.isRequired,
        fileSize: PropTypes.number.isRequired,
        downloadCount: PropTypes.number.isRequired,
        userEmail: PropTypes.string.isRequired,
      })
  ).isRequired,
  email: PropTypes.string.isRequired,
  onFileDownload: PropTypes.func.isRequired,
  onFileDelete: PropTypes.func.isRequired,
};

export default FileList;
