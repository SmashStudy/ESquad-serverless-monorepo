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
  const lambdaUrl = 'https://i6jmvlltoa.execute-api.us-east-1.amazonaws.com/dev/files'

  useEffect(() => {
    // Fetch files metadata
    const fetchFiles = async () => {
      try {
        const response = await axios.get(`${lambdaUrl}/metadata`, {
          params: {targetId: studyId, targetType: 'STUDY_PAGE'}
        });

        const parsedData = JSON.parse(response.data.body)
        setUploadedFiles(parsedData);
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
    setSnackbar({severity: 'info', message: '파일 업로드 중...', open: true})

    try {
      // const token = localStorage.getItem('jwt');
      const uniqueFileName = `${Date.now()}-${selectedFile.name}`; // 고유한 파일 이름 생성

      const presignedResponse = await axios.post(`${lambdaUrl}/presigned-url`, {
        action: 'putObject',
        fileKey: "files/" + uniqueFileName,
        contentType: selectedFile.type
      });

      const presignedUrl = JSON.parse(presignedResponse.data.body).presignedUrl;

      await axios.put(presignedUrl, selectedFile, {
        headers: {'Content-Type': selectedFile.type}
      });

      const metadataResponse = await axios.post(`${lambdaUrl}/store-metadata`, {
            fileKey: "files/" + uniqueFileName,
            metadata: { // metadata 필드 내에 필요한 정보들을 넣습니다.
              targetId: studyId,
              targetType: 'STUDY_PAGE',
              userId: 123, // 예시 사용자 ID
              fileSize: selectedFile.size,
              extension: selectedFile.type.split('/').pop(),
              contentType: selectedFile.type,
              originalFileName: selectedFile.name,
              storedFileName: uniqueFileName, // 고유 파일 이름을 메타데이터에 저장
              createdAt: getFormattedDate()
            }

          },
          // {headers: { Authorization: `Bearer ${token}` }}
      );

      const parsedBody = JSON.parse(metadataResponse.data.body);

      const newFileData = parsedBody.data;  // data 속성 접근

      setUploadedFiles(
          (prevFiles) => Array.isArray(prevFiles) ? [...prevFiles, newFileData]
              : [newFileData]);

      setSelectedFile(null);
      setSnackbar({severity: 'success', message: '파일 업로드 완료', open: true})
    } catch (error) {
      console.error('Failed to upload file:', error);
      setSnackbar({severity: 'fail', message: '파일 업로드 실패', open: true})
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileDelete = async (storedFileName) => {
    try {
      setSnackbar({severity: 'info', message: '파일 삭제 중...', open: true})

      const presignedResponse = await axios.post(`${lambdaUrl}/presigned-url`, {
        action: 'deleteObject',
        fileKey: "files/" + storedFileName,
      });

      const presignedUrl = JSON.parse(presignedResponse.data.body).presignedUrl;

      await axios.delete(presignedUrl); // S3 객체 삭제
      await axios.delete(`${lambdaUrl}/${storedFileName}`); // 메타데이터 삭제

      setUploadedFiles((prevFiles) => // 리스트업 돼있는 UI에서 삭제
          prevFiles.filter((file) => file.storedFileName !== storedFileName)
      );

      setSnackbar({severity: 'success', message: '파일 삭제 완료', open: true})
    } catch (error) {

      setSnackbar({severity: 'fail', message: '파일 삭제 실패', open: true})
      console.error('Failed to delete file:', error);
    }
  };

  const handleFileDownload = async (storedFileName, originalFileName) => {
    try {
      setSnackbar({severity: 'info', message: '파일 다운로드 중...', open: true})
      const presignedResponse = await axios.post(`${lambdaUrl}/presigned-url`, {
        action: 'getObject',
        fileKey: "files/" + storedFileName,
      });

      const presignedUrl = JSON.parse(presignedResponse.data.body).presignedUrl;

      const downloadResponse = await axios.get(presignedUrl,
          {responseType: 'blob'});

      const blob = new Blob([downloadResponse.data],
          {type: downloadResponse.headers['content-type']});
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = originalFileName || storedFileName; // 다운로드할 파일 이름 설정
      document.body.appendChild(link);
      link.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);

      setSnackbar({open: true, message: '파일 다운로드 성공', severity: 'success'})
    } catch (error) {
      setSnackbar({severity: 'fail', message: '파일 다운로드 실패', open: true})
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
            anchorOrigin={{vertical: 'center', horizontal: 'center'}}
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
            <Box sx={{mb: 2, display:'flex', gap: 1, alignItems:'center', justifyContent: 'flex-end'}}>

              <FormControl variant="outlined" sx={{minWidth: 80}}
                           size={'small'}>
                <InputLabel>정렬 기준</InputLabel>
                <Select value={sortCriteria} onChange={handleSortChange}
                        label="정렬 기준">
                  <MenuItem value="name">파일명</MenuItem>
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
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        width: '100%',
                        flexWrap: 'wrap'
                      }}>

                        {/* 파일명 */}
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          flex: 3,
                          minWidth: '200px'
                        }}>
                          <ListItemIcon>
                            <AttachFileIcon/>
                          </ListItemIcon>
                          <Typography variant="body2" color="textSecondary"
                                      sx={{mr: 1}}>
                            파일명:
                          </Typography>
                          <Typography variant="body2" color="textPrimary" sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            maxWidth: '200px'
                          }}>
                            {file.originalFileName}
                          </Typography>
                        </Box>

                        {/* 확장자명 */}
                        <Box sx={{
                          flex: 1,
                          minWidth: '150px',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <Typography variant="body2" color="textSecondary"
                                      sx={{mr: 1}}>
                            파일 확장자:
                          </Typography>
                          <Typography variant="body2" color="textPrimary">
                            {file.extension}
                          </Typography>
                        </Box>

                        {/* 게시일 */}
                        <Box sx={{
                          flex: 1,
                          minWidth: '180px',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <Typography variant="body2" color="textSecondary"
                                      sx={{mr: 1}}>
                            게시일:
                          </Typography>
                          <Typography variant="body2" color="textPrimary">
                            {file.createdAt}
                          </Typography>
                        </Box>

                        {/* 파일 크기 */}
                        <Box sx={{
                          flex: 1,
                          minWidth: '150px',
                          textAlign: 'left',
                          display: 'flex',
                          alignItems: 'center'
                        }}>
                          <Typography variant="body2" color="textSecondary"
                                      sx={{mr: 1}}>
                            파일 크기:
                          </Typography>
                          <Typography variant="body2" color="textPrimary">
                            {formatFileSize(file.fileSize)}
                          </Typography>
                        </Box>

                        {/* 다운로드 및 삭제 버튼 */}
                        <Box sx={{flex: '0 0 auto', display: 'flex', gap: 1}}>
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
