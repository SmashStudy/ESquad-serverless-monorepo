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
  Alert, CircularProgress
} from '@mui/material';
import {useLocation, useParams} from 'react-router-dom';
import axios from 'axios';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PropTypes from "prop-types";
import {UserByEmail} from "../../../components/user/UserByEmail.jsx";

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
  const storageApi = 'https://api.esquad.click/dev/files';
  const userApi = 'https://api.esquad.click/dev/users'
  const [currentPage, setCurrentPage] = useState(1);
  const [lastEvaluatedKeys, setLastEvaluatedKeys] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [email, setEmail] = useState('unknown');
  const [isLoading, setIsLoading] = useState(false);

  const fetchFiles = async () => {
    try {
      setIsLoading(true);
      const lastEvaluatedKey = lastEvaluatedKeys[currentPage - 1];
      const response = await axios.get(`${storageApi}/metadata`, {
        params: {
          targetId: studyId,
          targetType: 'STUDY_PAGE',
          limit: 5,
          lastEvaluatedKey: lastEvaluatedKey || undefined,
        },
      });

      const filesWithNicknames = await Promise.all(
          response.data.items.map(async (file) => {
            try {
              const user = await UserByEmail(file.userEmail);

              return {
                ...file,
                nickname: user.nickname || 'Unknown',
              };
            } catch (error) {
              return { ...file, nickname: 'Unknown' };
            }
          })
      );
      setUploadedFiles(filesWithNicknames);

      setLastEvaluatedKeys((prevKeys) => {
        const newKeys = [...prevKeys];
        if (response.data.lastEvaluatedKey) {
          newKeys[currentPage] = response.data.lastEvaluatedKey;
        } else if (currentPage < totalPages) {
          newKeys[currentPage] = null;
        }
        return newKeys;
      });

      if (response.data.lastEvaluatedKey) {
        setTotalPages(currentPage + 1);
      } else {
        setTotalPages(currentPage);
      }
    } catch (error) {
      setSnackbar(
          { severity: 'fail', message: '파일 정보를 가져오는데 실패했습니다.', open: true }
      );
      console.error('Failed to fetch files:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const fetchUserEmail = async () => {
    const { email } = await getEmailFromToken();
    setEmail(email);
  }
  useEffect(() => {

    fetchFiles();
    fetchUserEmail();
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

  const getEmailFromToken = async () => {
    const token = localStorage.getItem("jwtToken");

    try {
      const response = await axios.get(`${userApi}/get-email`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error:', error.response?.data || error.message);
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
          `${storageApi}/presigned-url`,
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
          `${storageApi}/store-metadata`,
          {
            fileKey: `files/${uniqueFileName}`,
            metadata: {
              targetId: studyId,
              targetType: 'STUDY_PAGE',
              userEmail: email,
              fileSize: selectedFile.size,
              extension: selectedFile.type.split('/').pop(),
              contentType: selectedFile.type,
              originalFileName: selectedFile.name,
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
      setCurrentPage(1);
      fetchFiles();

    }
  };

  const handleFileDelete = async (fileKey) => {
    try {
      setSnackbar({severity: 'info', message: '파일 삭제 중...', open: true});

      const presignedResponse = await axios.post(
          `${storageApi}/presigned-url`,
          {action: 'deleteObject', fileKey: fileKey},
          {headers: {'Content-Type': 'application/json'}}
      );

      await axios.delete(presignedResponse.data.presignedUrl);
      await axios.delete(`${storageApi}/${encodeURIComponent(fileKey)}`);

      setUploadedFiles((prevFiles) =>
          prevFiles.filter((file) => file.fileKey !== fileKey)
      );
      setSnackbar({severity: 'success', message: '파일 삭제 완료', open: true});
    } catch (error) {
      setSnackbar({severity: 'fail', message: '파일 삭제 실패', open: true});
      console.error('Failed to delete file:', error);
    } finally {
      setCurrentPage(1);
      fetchFiles();
    }
  };

  const handleFileDownload = async (fileKey, originalFileName) => {
    try {
      setSnackbar({severity: 'info', message: '파일 다운로드 중...', open: true});

      const presignedResponse = await axios.post(
          `${storageApi}/presigned-url`,
          {action: 'getObject', fileKey: fileKey},
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
      link.download = originalFileName || fileKey;
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

            {isLoading ? (
                <Typography variant="h5" sx={{ color: '#9F51E8', textAlign: 'center' }} >
                  <CircularProgress size={"3rem"}/>
                  {/*<LinearProgress color="success" />*/}
                  <br/>
                  로딩 중...
                </Typography>
            ) : (

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
                                {file.nickname}
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
                                    handleFileDownload(file.fileKey,
                                        file.originalFileName)
                                }
                            >
                              <DownloadIcon/>
                            </IconButton>
                            <IconButton
                                edge="end"
                                aria-label="delete"
                                onClick={() => handleFileDelete(
                                    file.fileKey)}
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

            ) }


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
        userEmail: PropTypes.string.isRequired,
        fileSize: PropTypes.number.isRequired,
        extension: PropTypes.string.isRequired,
        contentType: PropTypes.string.isRequired,
        originalFileName: PropTypes.string.isRequired,
        createdAt: PropTypes.string.isRequired,
      })
  ),
};

export default StudyDetailPage;
