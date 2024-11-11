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
  Alert, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';
import {useLocation, useParams} from "react-router-dom";
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
  const [snackbar, setSnackbar] = useState(
      {open: false, message: '', severity: 'success'})
  const [sortCriteria, setSortCriteria] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('asc');
  const lambdaUrl = 'https://ntja9tz0ra.execute-api.us-east-1.amazonaws.com/dev/files'

  useEffect(() => {
    // Fetch files metadata
    const fetchFiles = async () => {
      try {
        const response = await axios.get(`${lambdaUrl}/metadata`, {
          params: {targetId: studyId, targetType: 'STUDY_PAGE'}
        });

        setUploadedFiles(response.data);
      } catch (error) {
        setSnackbar(
            {severity: 'fail', message: '파일 정보를 가져오는데 실패했습니다.', open: true})
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
      return `${sizeInBytes} B`; // 바이트 단위
    } else if (sizeInBytes < 1024 * 1024) {
      return `${(sizeInBytes / 1024).toFixed(2)} KB`; // KB 단위
    } else if (sizeInBytes < 1024 * 1024 * 1024) {
      return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`; // MB 단위
    } else {
      return `${(sizeInBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`; // GB 단위
    }
  };

  const handleSortChange = (event) => {
    setSortCriteria(event.target.value);
  };

  const handleSortOrderChange = (event) => {
    setSortOrder(event.target.value);
  }

  const sortedFiles = [...uploadedFiles].sort((a, b) => {
    let comparison = 0;
    switch (sortCriteria) {
      case 'name':
        comparison = a.originalFileName.localeCompare(b.originalFileName);
        break;
      case 'extension':
        comparison = a.extension.localeCompare(b.extension);
        break;
      case 'userId':
        comparison = a.userId.localeCompare(b.userId);
        break;
      case 'createdAt':
        comparison = new Date(a.createdAt) - new Date(b.createdAt);
        break;
      case 'fileSize':
        comparison = a.fileSize - b.fileSize;
        break;
      default:
        return 0;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

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
      // const token = localStorage.getItem('jwt');
      const uniqueFileName = `${Date.now()}-${selectedFile.name}`;

      const presignedResponse = await axios.post(
          `${lambdaUrl}/presigned-url`,
          {
            action: 'putObject',
            fileKey: `files/${uniqueFileName}`,
            contentType: selectedFile.type,
          },
          {
            headers: {'Content-Type': 'application/json'},
          }
      );

      const presignedUrl = presignedResponse.data.presignedUrl;

      await axios.put(presignedUrl, selectedFile, {
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
          // {headers: { Authorization: `Bearer ${token}` }}
          {
            headers: {'Content-Type': 'application/json'},
          }
      );

      const newFileData = metadataResponse.data.data;

      setUploadedFiles((prevFiles) =>
          Array.isArray(prevFiles) ? [...prevFiles, newFileData] : [newFileData]
      );

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
          {
            action: 'deleteObject',
            fileKey: `files/${storedFileName}`,
          },
          {
            headers: {'Content-Type': 'application/json'},
          }
      );

      const presignedUrl = presignedResponse.data.presignedUrl;

      // S3 객체 삭제
      await axios.delete(presignedUrl);

      // 메타데이터 삭제 요청
      await axios.delete(`${lambdaUrl}/${storedFileName}`);

      // UI 업데이트
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
          {
            action: 'getObject',
            fileKey: `files/${storedFileName}`,
          },
          {
            headers: {'Content-Type': 'application/json'},
          }
      );

      const presignedUrl = presignedResponse.data.presignedUrl;

      // S3에서 파일 다운로드
      const downloadResponse = await axios.get(presignedUrl, {
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

  // <<<<<<<<<<<< Functions <<<<<<<<<<<<

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
        {/* Snackbar Component for Notifications */}
        <Snackbar
            open={snackbar.open}
            autoHideDuration={3000}
            onClose={handleSnackbarClose}
            anchorOrigin={{vertical: 'bottom', horizontal: 'center'}}
        >
          <Alert variant='filled' onClose={handleSnackbarClose}
                 severity={snackbar.severity}
                 sx={{width: '100%'}}>
            {snackbar.message}
          </Alert>
        </Snackbar>

        {/* Study Data Section */}
        <Box sx={{my: 4}}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {study.title}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            {study.members}
          </Typography>
        </Box>


        {/* Attachments Section */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon/>}
                            aria-controls="panel1a-content" id="panel1a-header">
            <Typography>공유파일 리스트</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{mb: 2, display: 'flex', gap: 2, alignItems: 'center'}}>
              {/* File Upload Input */}
              <Button variant="contained" component="label" color="primary"
                      startIcon={<UploadFileIcon/>}>
                파일 추가
                <input type="file" hidden onChange={handleFileChange}/>
              </Button>
            </Box>

            {/* Selected Files Preview */}
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

            {/* Sort Criteria Selection */}
            <Box sx={{
              mb: 2,
              display: 'flex',
              gap: 1,
              alignItems: 'center',
              justifyContent: 'flex-end'
            }}>

              <FormControl variant="outlined" sx={{minWidth: 80}}
                           size={'small'}>
                <InputLabel>정렬 기준</InputLabel>
                <Select value={sortCriteria} onChange={handleSortChange}
                        label="정렬 기준">
                  <MenuItem value="name">파일명</MenuItem>
                  <MenuItem value="extension">파일 유형</MenuItem>
                  <MenuItem value="userId">게시자</MenuItem>
                  <MenuItem value="createdAt">게시일</MenuItem>
                  <MenuItem value="fileSize">파일 크기</MenuItem>
                </Select>
              </FormControl>

              {/* Sort Order Selection */}
              <FormControl variant="outlined" sx={{minWidth: 80}}
                           size={'small'}>
                <InputLabel>정렬 순서</InputLabel>
                <Select value={sortOrder} onChange={handleSortOrderChange}
                        label="정렬 순서">
                  <MenuItem value="asc">오름차순</MenuItem>
                  <MenuItem value="desc">내림차순</MenuItem>
                </Select>
              </FormControl>
            </Box>


            {/* Attachments List */}
            <List>
              {sortedFiles && sortedFiles.length > 0 ? (
                  sortedFiles.map((file) => (
                      <ListItem key={file.id} sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        width: '100%',
                        flexWrap: 'wrap',
                        padding: 2,
                        borderBottom: '1px solid #ddd'
                      }}>
                        {/* 첫 번째 줄: 파일명과 확장자 */}
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

                        {/* 두 번째 줄: 게시자, 게시일, 파일 크기, 다운로드 및 삭제 버튼 */}
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
                                게시자:
                              </Typography>
                              <Typography variant="body2" color="textPrimary">
                                {file.userId}
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
                  <Typography variant="body2" color="textSecondary">
                    첨부파일이 없습니다.
                  </Typography>
              )}
            </List>


          </AccordionDetails>
        </Accordion>

      </Box>
  );
};

StudyDetailPage.propTypes = {
  uploadedFiles: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        targetId: PropTypes.number.isRequired,
        targetType: PropTypes.string.isRequired,
        userId: PropTypes.number.isRequired,
        fileSize: PropTypes.number.isRequired,
        extension: PropTypes.string.isRequired,
        contentType: PropTypes.string.isRequired,
        storedFileName: PropTypes.string.isRequired,
        originalFileName: PropTypes.string.isRequired,
        createdAt: PropTypes.string.isRequired
      })
  ).isRequired,
};

export default StudyDetailPage;
