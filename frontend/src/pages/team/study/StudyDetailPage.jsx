import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { useLocation, useParams } from "react-router-dom";
import axios from 'axios';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import bookProfileManAndSea from '../../../assets/book-profile-man-and-sea.jpg';
import PropTypes from "prop-types";

const StudyDetailPage = ({ isSmallScreen, isMediumScreen }) => {
  const location = useLocation();
  const study = location.state.study;
  const { studyId } = useParams();
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState();
  const lambdaUrl = 'https://i6jmvlltoa.execute-api.us-east-1.amazonaws.com/dev/files'

  useEffect(() => {
    // Fetch files metadata
    const fetchFiles = async () => {
      try {
        const response = await axios.get(`${lambdaUrl}/metadata`, {
          params: { targetId: studyId, targetType: 'STUDY_PAGE' }
        });
        // console.log("API Response:", response);  // 응답 전체 확인
        // console.log("Response Data:", response.data);  // 응답 본문만 확인

        const parsedData = JSON.parse(response.data.body)
        setUploadedFiles(parsedData);
      } catch (error) {
        console.error('Failed to fetch files:', error);
      }
    };
    fetchFiles();
  }, [studyId]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);

    try {
      // const token = localStorage.getItem('jwt');
      const uniqueFileName = `${Date.now()}-${selectedFile.name}`; // 고유한 파일 이름 생성

      // 1. Presigned URL 요청
      const presignedResponse = await axios.post(`${lambdaUrl}/presigned-url`, {
        action: 'putObject',
        fileKey: "files/"+uniqueFileName,
        contentType: selectedFile.type
      });

      const presignedUrl = JSON.parse(presignedResponse.data.body).presignedUrl;

      // 2. Presigned URL을 통한 파일 업로드
      await axios.put(presignedUrl, selectedFile, {
        headers: { 'Content-Type': selectedFile.type }
      });

      // 3. 파일 메타데이터 저장 요청
      const metadataResponse = await axios.post(`${lambdaUrl}/store-metadata`, {
            fileKey: "files/"+uniqueFileName,
            metadata: { // metadata 필드 내에 필요한 정보들을 넣습니다.
              targetId: studyId,
              targetType: 'STUDY_PAGE',
              userId: 123, // 예시 사용자 ID
              fileSize: selectedFile.size,
              extension: selectedFile.type.split('/').pop(),
              contentType: selectedFile.type,
              originalFileName: selectedFile.name,
              storedFileName: uniqueFileName, // 고유 파일 이름을 메타데이터에 저장
              createdAt: new Date().toISOString().slice(0, 16).replace("T", "-").replace(":", "-")
            }

      },
          // {headers: { Authorization: `Bearer ${token}` }}
      );

      // console.log(metadataResponse);
      // console.log(metadataResponse.data);
      // console.log(metadataResponse.data.data);
      // console.log(JSON.parse(metadataResponse.data.body).data);
      // console.log("test " + metadataResponse.data);
      // console.log("test " + JSON.stringify(metadataResponse.data, null, 2));
      // const parsedBody = JSON.parse(metadataResponse.data.body).data;
      // const newFileData = parsedBody.data;
      // console.log("parsedBody + Data is : "+parsedBody);
      // console.log("parsedBody + Data is : "+parsedBody.data);

      const parsedBody = JSON.parse(metadataResponse.data.body);
      // console.log("Parsed body is:", parsedBody);  // 여기서 parsedBody의 구조를 확인해 주세요.

      const newFileData = parsedBody.data;  // data 속성 접근
      // console.log("newFileData is:", newFileData);


      // setUploadedFiles((prevFiles) => [...prevFiles, JSON.parse(metadataResponse.data.body).data]);
      setUploadedFiles((prevFiles) => Array.isArray(prevFiles) ? [...prevFiles, newFileData] : [newFileData]);

      setSelectedFile(null);
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setIsUploading(false);
    }
  };


  const handleFileDelete = async (storedFileName) => {
    try {
      await axios.delete(`${lambdaUrl}/${storedFileName}`);
      setUploadedFiles((prevFiles) =>
          prevFiles.filter((file) => file.storedFileName !== storedFileName)
      );
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const handleFileDownload = async (storedFileName, originalFileName) => {
    try {
      const presignedResponse = await axios.post(`${lambdaUrl}/presigned-url`, {
        action: 'getObject',
        fileKey: "files/"+storedFileName,
      });

      const presignedUrl = JSON.parse(presignedResponse.data.body).presignedUrl;

      // 2. Presigned URL을 사용하여 파일 다운로드
      const downloadResponse = await axios.get(presignedUrl, { responseType: 'blob' });

      // 3. 다운로드된 파일을 Blob으로 변환하고, 브라우저에서 자동 다운로드
      const blob = new Blob([downloadResponse.data], { type: downloadResponse.headers['content-type'] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = originalFileName || storedFileName; // 다운로드할 파일 이름 설정
      document.body.appendChild(link);
      link.click();

      // 사용 후 URL과 링크 정리
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };


  return (
      <Box sx={{ border: '1px solid', display: 'flex', flexDirection: 'column', mb: 3, p: 2, gap: 2 }}>
        <Box sx={{ width: '100%', height: '20vh', overflowY: 'auto' }}>
          <Box
              component="img"
              src={study.bookImage || bookProfileManAndSea}
              alt={study.title}
              sx={{ width: '100%', objectFit: 'contain', mb: 2 }}
          />
        </Box>
        <Divider sx={{ borderBottom: '1px solid #ddd' }} />

        {/* Study Data Section */}
        <Box sx={{ my: 4 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            {study.title}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" gutterBottom>
            {study.members}
          </Typography>
        </Box>

        {/* Attachments Section */}
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="panel1a-content" id="panel1a-header">
            <Typography>공유파일 리스트</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
              {/* File Upload Input */}
              <Button variant="contained" component="label" color="primary" startIcon={<UploadFileIcon />}>
                파일 추가
                <input type="file" hidden onChange={handleFileChange} />
              </Button>
            </Box>

            {/* Selected Files Preview */}
            {selectedFile && (
                <Box sx={{ mb: 2, display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="body2" color="textSecondary">
                    선택한 파일:
                  </Typography>
                  <ListItem>
                    <ListItemIcon>
                      <AttachFileIcon />
                    </ListItemIcon>
                    <ListItemText primary={selectedFile.name} />
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

            {/* Attachments List */}
            <List>
              {uploadedFiles && uploadedFiles.length > 0 ? (
                  uploadedFiles.map((file) => (
                      <ListItem key={file.id}>
                        <ListItemIcon>
                          <AttachFileIcon />
                        </ListItemIcon>
                        <ListItemText primary={file.originalFileName} />
                        <ListItemText primary={file.createdAt} />
                        <ListItemText primary={file.fileSize} />

                        <IconButton edge="end" aria-label="download" onClick={() => handleFileDownload(file.storedFileName, file.originalFileName)}>
                          <DownloadIcon />
                        </IconButton>
                        <IconButton edge="end" aria-label="delete" onClick={() => handleFileDelete(file.storedFileName)}>
                          <DeleteIcon />
                        </IconButton>
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
