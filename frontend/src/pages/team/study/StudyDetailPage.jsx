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
  Alert
} from '@mui/material';
import {useLocation, useParams} from "react-router-dom";
import axios from 'axios';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const StudyDetailPage = ({isSmallScreen, isMediumScreen}) => {
  const location = useLocation();
  const study = location.state.study;
  const {studyId} = useParams();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  const [snackbar, setSnackbar] = useState(
      {open: false, message: '', severity: 'success'});
  const lambdaUrl = 'https://ntja9tz0ra.execute-api.us-east-1.amazonaws.com/dev/files';
  const [currentPage, setCurrentPage] = useState(1); // 현재 페이지 번호
  const [lastEvaluatedKeys, setLastEvaluatedKeys] = useState([]); // 각 페이지별 LastEvaluatedKey 저장
  const [totalPages, setTotalPages] = useState(5); // 예시로 총 5페이지로 설정

  useEffect(() => {
    // Fetch files metadata
    const fetchFiles = async () => {
      try {
        const response = await axios.get(`${lambdaUrl}/metadata`, {
          params: {targetId: studyId, targetType: 'STUDY_PAGE'}
        });

        // received files are sorted by createdAt in descending order
        setUploadedFiles(response.data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (error) {
        setSnackbar(
            {severity: 'fail', message: '파일 정보를 가져오는데 실패했습니다.', open: true});
        console.error('Failed to fetch files:', error);
      }
    };
    fetchFiles();
  }, [studyId]);

  // >>>>>>>>>>>> Utils >>>>>>>>>>>>

  const handleSnackbarClose = () => {
    setSnackbar({...snackbar, open: false});
  }

  const getFormattedDate = () => {
    const now = new Date();

    const koreanTime = new Date(now.setHours(now.getHours()));

    // 원하는 포맷으로 변환
    const year = koreanTime.getFullYear();
    const month = String(koreanTime.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1 필요
    const day = String(koreanTime.getDate()).padStart(2, '0');
    const hours = String(koreanTime.getHours()).padStart(2, '0');
    const minutes = String(koreanTime.getMinutes()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  const formatFileSize = (sizeInBytes) => {
    if (sizeInBytes < 1024) {
      return `${sizeInBytes} B`;
    }// 바이트 단위
    else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(
          2)} KB`;
    }// KB 단위
    else if (sizeInBytes < 1024 * 1024 * 1024) {
      return `${(sizeInBytes / (1024
          * 1024)).toFixed(2)} MB`;
    }// MB 단위
    else {
      return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    } // GB 단위
  };

  // <<<<<<<<<<<< Utils <<<<<<<<<<<<

  // >>>>>>>>>>>> Functions >>>>>>>>>>>>

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
            contentType: selectedFile.type
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
      setUploadedFiles((prevFiles) => [...prevFiles, newFileData]);
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

      setUploadedFiles((prevFiles) => prevFiles.filter(
          (file) => file.storedFileName !== storedFileName));
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
    setCurrentPage(pageNumber);
    // 페이지네이션 구현에 필요한 추가 로직
  };

  return (
      <Box sx={{
        border: '1px solid',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        mb: 3,
        p: 2,
        gap: 2
      }}>
        <Box sx={{width: '100%', height: '20vh', overflowY: 'auto'}}>
          <Box
              component="img"
              src={study.bookImage
                  || "https://s3-esquad-public.s3.us-east-1.amazonaws.com/book-profile-man-and-sea-lJaouK3e.jpg"}
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
          <Alert variant='filled' onClose={handleSnackbarClose}
                 severity={snackbar.severity} sx={{width: '100%'}}>
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
          <AccordionSummary expandIcon={<ExpandMoreIcon/>}
                            aria-controls="panel1a-content" id="panel1a-header">
            <Typography>공유파일 리스트</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{mb: 2, display: 'flex', gap: 2, alignItems: 'center'}}>
              <Button variant="contained" component="label" color="primary"
                      startIcon={<UploadFileIcon/>}>
                파일 추가
                <input type="file" hidden onChange={handleFileChange}/>
              </Button>
            </Box>

            {selectedFile && (
                <Box sx={{
                  mb: 2,
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 2,
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
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
                      <ListItem key={file.id} sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        width: '100%',
                        flexWrap: 'wrap',
                        padding: 2,
                        borderBottom: '1px solid #ddd'
                      }}>
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%'
                        }}>
                          <Box sx={{display: 'flex', alignItems: 'center'}}>
                            <ListItemIcon>
                              <AttachFileIcon/>
                            </ListItemIcon>
                            <Typography variant="body1" color="textPrimary"
                                        sx={{
                                          whiteSpace: 'nowrap',
                                          overflow: 'hidden',
                                          textOverflow: 'ellipsis',
                                          maxWidth: '600px'
                                        }}>
                              {file.originalFileName}
                            </Typography>
                          </Box>
                        </Box>

                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          mt: 1
                        }}>
                          <Box sx={{
                            display: 'flex',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: 2
                          }}>
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                              <Typography variant="body2" color="textSecondary"
                                          sx={{mr: 1}}>파일 유형:</Typography>
                              <Typography variant="body2"
                                          color="textPrimary">{file.extension}</Typography>
                            </Box>
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                              <Typography variant="body2" color="textSecondary"
                                          sx={{mr: 1}}>게시자:</Typography>
                              <Typography variant="body2"
                                          color="textPrimary">{file.userId}</Typography>
                            </Box>
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                              <Typography variant="body2" color="textSecondary"
                                          sx={{mr: 1}}>게시일:</Typography>
                              <Typography variant="body2"
                                          color="textPrimary">{file.createdAt}</Typography>
                            </Box>
                            <Box sx={{display: 'flex', alignItems: 'center'}}>
                              <Typography variant="body2" color="textSecondary"
                                          sx={{mr: 1}}>파일 크기:</Typography>
                              <Typography variant="body2"
                                          color="textPrimary">{formatFileSize(
                                  file.fileSize)}</Typography>
                            </Box>
                          </Box>
                          <Box sx={{display: 'flex', gap: 1}}>
                            <IconButton edge="end" aria-label="download"
                                        onClick={() => handleFileDownload(
                                            file.storedFileName,
                                            file.originalFileName)}>
                              <DownloadIcon/>
                            </IconButton>
                            <IconButton edge="end" aria-label="delete"
                                        onClick={() => handleFileDelete(
                                            file.storedFileName)}>
                              <DeleteIcon/>
                            </IconButton>
                          </Box>
                        </Box>
                      </ListItem>
                  ))
              ) : (
                  <Typography variant="body2" color="textSecondary">첨부파일이
                    없습니다.</Typography>
              )}
            </List>

            <Box display="flex" justifyContent="center" mt={2}>
              <Button onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}>이전</Button>
              {Array.from({length: totalPages}, (_, i) => (
                  <Button key={i + 1} onClick={() => handlePageChange(i + 1)}
                          variant={currentPage === i + 1 ? 'contained'
                              : 'outlined'}>
                    {i + 1}
                  </Button>
              ))}
              <Button onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}>다음</Button>
            </Box>

          </AccordionDetails>
        </Accordion>
      </Box>
  );
};

export default StudyDetailPage;
