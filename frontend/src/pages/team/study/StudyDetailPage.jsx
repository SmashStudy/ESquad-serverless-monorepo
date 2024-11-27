import React, {useState, useEffect} from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  CircularProgress
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {useLocation, useParams} from 'react-router-dom';
import axios from 'axios';
import FileUploader from '../../../components/storage/FileUploader.jsx';
import FileList from '../../../components/storage/FileList.jsx';
import {
  getFormattedDate,
  formatFileSize
} from '../../../utils/fileFormatUtils.js';
import Pagination from '../../../components/storage/Pagination.jsx';
import SnackbarAlert from '../../../components/storage/SnackBarAlert.jsx';
import {UserByEmail} from '../../../components/user/UserByEmail.jsx';
import {useTheme} from "@mui/material";
import UsePresignedUrl from "../../../hooks/storage/UsePresignedUrl.jsx";
import {getStorageApi, getUserApi} from "../../../utils/apiConfig.js";

const StudyDetailPage = ({isSmallScreen, isMediumScreen}) => {
  const location = useLocation();
  const study = location.state.study;
  const theme = useTheme();
  const {studyId} = useParams();
  const {requestPresignedUrl} = UsePresignedUrl();

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [lastEvaluatedKeys, setLastEvaluatedKeys] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [email, setEmail] = useState('unknown');
  const [isLoading, setIsLoading] = useState(false);

  const storageApi = getStorageApi();
  const userApi = getUserApi();

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
              return {...file, nickname: 'Unknown'};
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
          {severity: 'error', message: '파일 정보를 가져오는데 실패했습니다.', open: true});
      console.error('Failed to fetch files:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserEmail = async () => {
    const token = localStorage.getItem('jwtToken');
    try {
      const response = await axios.get(`${userApi}/get-email`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setEmail(response.data.email);
    } catch (error) {
      console.error('Error fetching email:', error);
    }
  };

  useEffect(() => {
    fetchFiles();
    fetchUserEmail();
  }, [studyId, currentPage]);

  const handleSnackbarClose = () => {
    setSnackbar({...snackbar, open: false});
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
      const presignedResponse = await requestPresignedUrl('putObject',
          uniqueFileName);

      await axios.put(presignedResponse, selectedFile, {
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
      setCurrentPage(1);
      fetchFiles();
    } catch (error) {
      console.error('Failed to upload file:', error);
      setSnackbar({severity: 'error', message: '파일 업로드 실패', open: true});
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileDelete = async (fileKey, userEmail) => {
    if (email !== userEmail) {
      setSnackbar({severity: 'error', message: '업로더만 삭제할 수 있습니다.', open: true});
      return;
    }
    try {
      setSnackbar({severity: 'info', message: '파일 삭제 중...', open: true});
      const presignedResponse = await requestPresignedUrl('deleteObject',
          fileKey);
      await axios.delete(presignedResponse);
      await axios.delete(`${storageApi}/${encodeURIComponent(fileKey)}`);
      setUploadedFiles(
          (prevFiles) => prevFiles.filter((file) => file.fileKey !== fileKey));
      setSnackbar({severity: 'success', message: '파일 삭제 완료', open: true});
      setCurrentPage(1);
      fetchFiles();
    } catch (error) {
      setSnackbar({severity: 'error', message: '파일 삭제 실패', open: true});
      console.error('Failed to delete file:', error);
    }
  };

  const handleFileDownload = async (fileKey, originalFileName) => {
    try {
      setSnackbar({severity: 'info', message: '파일 다운로드 중...', open: true});
      const presignedResponse = await requestPresignedUrl('getObject', fileKey);
      const downloadResponse = await axios.get(
          presignedResponse, {
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
      setSnackbar({severity: 'error', message: '파일 다운로드 실패', open: true});
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
              src={
                  study.bookImage ||
                  'https://s3-esquad-public.s3.us-east-1.amazonaws.com/book-profile-man-and-sea-lJaouK3e.jpg'
              }
              alt={study.title}
              sx={{width: '100%', objectFit: 'contain', mb: 2}}
          />
        </Box>
        <Divider sx={{borderBottom: '1px solid #ddd'}}/>
        <SnackbarAlert
            open={snackbar.open}
            message={snackbar.message}
            severity={snackbar.severity}
            onClose={handleSnackbarClose}
        />
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
            <FileUploader
                selectedFile={selectedFile}
                onFileChange={handleFileChange}
                onFileUpload={handleFileUpload}
                isUploading={isUploading}
            />
            {isLoading ? (
                <Typography variant="h5" sx={{
                  color: `${theme.palette.primary.main}`,
                  textAlign: 'center'
                }}>
                  <CircularProgress size={"3rem"}/>
                  {/*<LinearProgress color="success" />*/}
                  <br/>
                  로딩 중...
                </Typography>
            ) : (
                <FileList
                    files={uploadedFiles}
                    email={email}
                    onFileDownload={handleFileDownload}
                    onFileDelete={handleFileDelete}
                    formatFileSize={formatFileSize}
                />
            )
            }
            <Pagination currentPage={currentPage} totalPages={totalPages}
                        onPageChange={handlePageChange}/>
          </AccordionDetails>
        </Accordion>
      </Box>
  );
};

export default StudyDetailPage;
