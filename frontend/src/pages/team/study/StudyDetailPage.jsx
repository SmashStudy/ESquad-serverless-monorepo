import React, {useState, useEffect} from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Divider,
  Button,
  Snackbar,
  Alert,
} from '@mui/material';
import {useLocation, useParams} from 'react-router-dom';
import axios from 'axios';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PropTypes from "prop-types";

const StudyDetailPage = ({isSmallScreen, isMediumScreen}) => {
  const location = useLocation();
  const study = location.state.study;
  const {studyId} = useParams();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const lambdaUrl = 'https://api.esquad.click/dev/files';
  const [currentPage, setCurrentPage] = useState(1);
  const [lastEvaluatedKeys, setLastEvaluatedKeys] = useState([]);
  const [totalPages, setTotalPages] = useState(1);

  const fetchFiles = async () => {
    try {
      const lastEvaluatedKey = lastEvaluatedKeys[currentPage - 1];
      const response = await axios.get(`${lambdaUrl}/metadata`, {
        params: {
          targetId: studyId,
          targetType: 'STUDY_PAGE',
          limit: 5,
          lastEvaluatedKey: lastEvaluatedKey || undefined,
        },
      });

      setUploadedFiles(response.data.items);

      setLastEvaluatedKeys((prevKeys) => {
        const newKeys = [...prevKeys];
        if (response.data.lastEvaluatedKey) {
          newKeys[currentPage] = response.data.lastEvaluatedKey;
        } else if (currentPage < totalPages) {
          newKeys[currentPage] = null; // 다음 페이지가 없음을 명확히 설정
        }
        return newKeys;
      });

      if (response.data.lastEvaluatedKey) {
        setTotalPages(currentPage + 1);
      } else {
        setTotalPages(currentPage); // 마지막 평가 키가 없으면 페이지를 더 증가시키지 않음
      }
    } catch (error) {
      setSnackbar(
          {severity: 'fail', message: '파일 정보를 가져오는데 실패했습니다.', open: true}
      );
      console.error('Failed to fetch files:', error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [studyId, currentPage]);

  const handleSnackbarClose = () => {
    setSnackbar({...snackbar, open: false});
  };

  const getFormattedDate = () => {
    const now = new Date();
    const koreanTime = new Date(now.setHours(now.getHours()));
    const year = koreanTime.getFullYear();
    const month = String(koreanTime.getMonth() + 1).padStart(2, '0');
    const day = String(koreanTime.getDate()).padStart(2, '0');
    const hours = String(koreanTime.getHours()).padStart(2, '0');
    const minutes = String(koreanTime.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const formatFileSize = (sizeInBytes) => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(2)} KB`;
    } else if (sizeInBytes < 1024 * 1024 * 1024) {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
    } else {
      return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) {
      return;
    }
    setIsUploading(true);
    setSnackbar({severity: 'info', message: '파일 업로드 중...', open: true});

    try {
      const uniqueFileName = `${Date.now()}-${selectedFile.name}`;

      const presignedResponse = await axios.post(
          `${lambdaUrl}/presigned-url`,
          {
            action: 'putObject',
            fileKey: `files/${uniqueFileName}`,
            contentType: selectedFile.type,
          },
          {headers: {'Content-Type': 'application/json'}}
      );

      await axios.put(presignedResponse.data.presignedUrl, selectedFile, {
        headers: {'Content-Type': selectedFile.type},
      });

      const metadataResponse = await axios.post(
          `${lambdaUrl}/store-metadata`,
          {
            fileKey: `files/${uniqueFileName}`,
            metadata: {
              targetId: studyId,
              targetType: 'STUDY_PAGE',
              userId: '말똥말똥성게',
              fileSize: selectedFile.size,
              extension: selectedFile.type.split('/').pop(),
              contentType: selectedFile.type,
              originalFileName: selectedFile.name,
              storedFileName: uniqueFileName,
              createdAt: getFormattedDate(),
            },
          },
          {headers: {'Content-Type': 'application/json'}}
      );

      const newFileData = metadataResponse.data.data;
      setUploadedFiles((prevFiles) => [newFileData, ...prevFiles]);
      setSelectedFile(null);
      setSnackbar({severity: 'success', message: '파일 업로드 완료', open: true});
    } catch (error) {
      console.error('Failed to upload file:', error);
      setSnackbar({severity: 'fail', message: '파일 업로드 실패', open: true});
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileDelete = async (storedFileName) => {
    try {
      setSnackbar({severity: 'info', message: '파일 삭제 중...', open: true});

      const presignedResponse = await axios.post(
          `${lambdaUrl}/presigned-url`,
          {action: 'deleteObject', fileKey: `files/${storedFileName}`},
          {headers: {'Content-Type': 'application/json'}}
      );

      await axios.delete(presignedResponse.data.presignedUrl);
      await axios.delete(`${lambdaUrl}/${storedFileName}`);

      setUploadedFiles((prevFiles) =>
          prevFiles.filter((file) => file.storedFileName !== storedFileName)
      );
      setSnackbar({severity: 'success', message: '파일 삭제 완료', open: true});
    } catch (error) {
      setSnackbar({severity: 'fail', message: '파일 삭제 실패', open: true});
      console.error('Failed to delete file:', error);
    }
  };

  const handleFileDownload = async (storedFileName, originalFileName) => {
    try {
      setSnackbar({severity: 'info', message: '파일 다운로드 중...', open: true});

      const presignedResponse = await axios.post(
          `${lambdaUrl}/presigned-url`,
          {action: 'getObject', fileKey: `files/${storedFileName}`},
          {headers: {'Content-Type': 'application/json'}}
      );

      const downloadResponse = await axios.get(
          presignedResponse.data.presignedUrl, {
            responseType: 'blob',
          });

      const blob = new Blob([downloadResponse.data], {
        type: downloadResponse.headers['content-type'],
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = originalFileName || storedFileName;
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      setSnackbar({open: true, message: '파일 다운로드 성공', severity: 'success'});
    } catch (error) {
      setSnackbar({severity: 'fail', message: '파일 다운로드 실패', open: true});
      console.error('Failed to download file:', error);
    }
  };

  const handlePageChange = (pageNumber) => {
    if (pageNumber > totalPages || pageNumber < 1) {
      return;
    }

    if (pageNumber > currentPage && !lastEvaluatedKeys[currentPage]) {
      // 다음 페이지로 가려는 경우 평가 키가 null이면 이동 불가
      return;
    }

    setCurrentPage(pageNumber);
  };

  return (
      <Box
          sx={{
            border: '1px solid',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            mb: 3,
            p: 2,
            gap: 2,
          }}
      >
        <Box sx={{width: '100%', height: '20vh', overflowY: 'auto'}}>
          <Box
              component="img"
              src={
                  study.bookImage ||
                  'https://s3-esquad-public.s3.us-east-1.amazonaws.com/book-profile-man-and-sea-lJaouK3e.jpg'
              }
              alt={study.title}
              sx={{width: '100%', objectFit: 'contain', mb: 2}}
          />
        </Box>
        <Divider sx={{borderBottom: '1px solid #ddd'}}/>
        <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={handleSnackbarClose}
            anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
        >
          <Alert
              variant="filled"
              onClose={handleSnackbarClose}
              severity={snackbar.severity}
              sx={{width: '100%'}}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>

        <Box sx={{my: 4}}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {study.title}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            {study.members}
          </Typography>
        </Box>

        <Accordion>
          <AccordionSummary
              expandIcon={<ExpandMoreIcon/>}
              aria-controls="panel1a-content"
              id="panel1a-header"
          >
            <Typography>공유파일 리스트</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{mb: 2, display: 'flex', gap: 2, alignItems: 'center'}}>
              <Button
                  variant="contained"
                  component="label"
                  color="primary"
                  startIcon={<UploadFileIcon/>}
              >
                파일 추가
                <input type="file" hidden onChange={handleFileChange}/>
              </Button>
            </Box>

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
                      onClick={handleFileUpload}
                      disabled={isUploading}
                  >
                    {isUploading ? '업로드 중...' : '등록'}
                  </Button>
                </Box>
            )}

            <List>
              {uploadedFiles && uploadedFiles.length > 0 ? (
                  uploadedFiles.map((file) => (
                      <ListItem
                          key={file.id}
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
                              <Typography
                                  variant="body2"
                                  color="textSecondary"
                                  sx={{mr: 1}}
                              >
                                파일 유형:
                              </Typography>
                              <Typography variant="body2" color="textPrimary">
                                {file.extension}
                              </Typography>
                            </Box>
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                              <Typography
                                  variant="body2"
                                  color="textSecondary"
                                  sx={{mr: 1}}
                              >
                                업로더:
                              </Typography>
                              <Typography variant="body2" color="textPrimary">
                                {file.userId}
                              </Typography>
                            </Box>
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                              <Typography
                                  variant="body2"
                                  color="textSecondary"
                                  sx={{mr: 1}}
                              >
                                게시일:
                              </Typography>
                              <Typography variant="body2" color="textPrimary">
                                {file.createdAt}
                              </Typography>
                            </Box>
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                              <Typography
                                  variant="body2"
                                  color="textSecondary"
                                  sx={{mr: 1}}
                              >
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
                                onClick={() =>
                                    handleFileDownload(file.storedFileName,
                                        file.originalFileName)
                                }
                            >
                              <DownloadIcon/>
                            </IconButton>
                            <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={() => handleFileDelete(
                                    file.storedFileName)}
                            >
                              <DeleteIcon/>
                            </IconButton>
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

            <Box display="flex" justifyContent="center" mt={2}>
              <Button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
              >
                이전
              </Button>

              <Button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!lastEvaluatedKeys[currentPage]}
              >
                다음
              </Button>
            </Box>
          </AccordionDetails>
        </Accordion>
      </Box>
  );
};

StudyDetailPage.propTypes = {
  uploadedFiles: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        targetId: PropTypes.string.isRequired,
        targetType: PropTypes.string.isRequired,
        userId: PropTypes.string.isRequired,
        fileSize: PropTypes.number.isRequired,
        extension: PropTypes.string.isRequired,
        contentType: PropTypes.string.isRequired,
        storedFileName: PropTypes.string.isRequired,
        originalFileName: PropTypes.string.isRequired,
        createdAt: PropTypes.string.isRequired,
      })
  ).isRequired,
};

export default StudyDetailPage;
