import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
  CircularProgress
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useLocation, useParams } from 'react-router-dom';
import FileUploader from '../../../components/storage/FileUploader.jsx';
import FileList from '../../../components/storage/FileList.jsx';
import Pagination from '../../../components/storage/Pagination.jsx';
import { useTheme } from '@mui/material';
import {
  fetchFiles,
  fetchUserEmail,
  handleFileUpload,
  handleFileDelete,
  handleFileDownload
} from '../../../utils/storage/utilities.js';
import LinearProgressWithLabel from "../../../components/custom/CustomMui.jsx";
import FilePreviewBeforeUpload from "../../../components/storage/FilePreviewBeforeUpload.jsx";

const StudyStatus = ({ startDate, endDate }) => {
  const theme = useTheme();
  const currentDate = Date.now();

  // 진행 중인지, 종료됐는지 체크
  let statusIcon = <AccessTimeIcon sx={{ color: theme.palette.warning.main }} />;
  let statusText = '진행 중';

  if (endDate && new Date(endDate).getTime() < currentDate) {
    statusIcon = <CheckCircleIcon sx={{ color: theme.palette.success.main }} />;
    statusText = '종료됨';
  } else if (startDate && new Date(startDate).getTime() > currentDate) {
    statusIcon = <AccessTimeIcon sx={{ color: theme.palette.info.main }} />;
    statusText = '시작 예정';
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, position: 'relative', top: 0, justifyContent: 'flex-end' }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        {statusIcon}
      </Box>

      <Typography
        variant="h5"
        fontWeight="bold"
        sx={{
          color: 'text.primary',
          marginLeft: '8px', // 아이콘과 텍스트 간의 간격을 설정
        }}
      >
        {statusText}
      </Typography>
    </Box>
  );
};


const StudyDetailPage = ({ isSmallScreen, isMediumScreen }) => {
  const location = useLocation();
  const study = location.state.study;
  const theme = useTheme();
  const { studyId } = useParams();

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(null);
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

  useEffect(() => {
    fetchFiles(
      studyId,
      'STUDY_PAGE',
      5,
      currentPage,
      lastEvaluatedKeys,
      setUploadedFiles,
      setLastEvaluatedKeys,
      setTotalPages,
      totalPages,
      setSnackbar,
      setIsLoading
    );
    fetchUserEmail(setEmail);
  }, [studyId, currentPage]);

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
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
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        mb: 3,
        p: 2,
        gap: 2,
        height: '100%',
        position: 'relative',
        backgroundColor: theme.palette.background.paper,
      }}
    >
      {/* 기간 정보 */}
      <StudyStatus startDate={study?.startDate} endDate={study?.endDate} />

      <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2 }}>
        {/* 이미지 영역 */}
        <Box sx={{ maxWidth: '40vh', maxHeight: '40vh' }}>
          <Box
            component="img"
            src={
              study?.imgPath ||
              'https://s3-esquad-public.s3.us-east-1.amazonaws.com/book-profile-man-and-sea-lJaouK3e.jpg'
            }
            alt={study?.studyName}
            sx={{
              objectFit: 'cover',
              borderRadius: '8px',
              boxShadow: 2,
              width: '100%',
              height: '100%',
            }}
          />
        </Box>

        {/* 스터디 정보 영역 */}
        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'left' }}>
          <Typography
            variant="h4"
            fontWeight="bold"
            sx={{
              mb: 2,
              color: theme.palette.text.primary,
              fontSize: { xs: '1.5rem', sm: '2rem' },
            }}
          >
            {study?.studyName || 'Loading...'}
          </Typography>
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              mb: 2,
              color: theme.palette.text.primary,
              fontSize: { xs: '1.5rem', sm: '1rem' },
            }}
          >
            {study?.description || 'Loading...'}
          </Typography>
        </Box>
      </Box>

      {/* 파일 시스템 영역 */}
      <Box sx={{ width: '100%' }}>
        
          <AccordionSummary aria-controls="panel1a-content" id="panel1a-header">
            <Typography>공유파일 리스트</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <FileUploader
              selectedFile={selectedFile}
              onFileChange={handleFileChange}
              onFileUpload={() =>
                handleFileUpload(
                  selectedFile,
                  email,
                  studyId,
                  'STUDY_PAGE',
                  setIsUploading,
                  setSnackbar,
                  setUploadedFiles,
                  setSelectedFile,
                  () =>
                    fetchFiles(
                      studyId,
                      'STUDY_PAGE',
                      5,
                      currentPage,
                      lastEvaluatedKeys,
                      setUploadedFiles,
                      setLastEvaluatedKeys,
                      setTotalPages,
                      totalPages,
                      setSnackbar,
                      setIsLoading
                    ),
                  setCurrentPage,
                  setUploadProgress
                )
              }
              isUploading={isUploading}
            />

            {selectedFile !== null && <FilePreviewBeforeUpload file={selectedFile} />}

            {downloadProgress && (
              <Box sx={{ my: 2, alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ mr: 2 }}>
                  다운로드 중... {downloadProgress.fileName}
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgressWithLabel variant="determinate" value={downloadProgress.percent} />
                </Box>
              </Box>
            )}

            {uploadProgress && (
              <Box sx={{ my: 2, alignItems: 'center' }}>
                <Typography variant="subtitle1" sx={{ mr: 2 }}>
                  업로드 중... {uploadProgress.fileName}
                </Typography>
                <Box sx={{ flexGrow: 1 }}>
                  <LinearProgressWithLabel variant="determinate" value={uploadProgress.percent} />
                </Box>
              </Box>
            )}

            {isLoading ? (
              <Typography
                variant="h5"
                sx={{
                  color: `${theme.palette.primary.main}`,
                  textAlign: 'center',
                }}
              >
                <CircularProgress size={"3rem"} />
                <br />
                로딩 중...
              </Typography>
            ) : (
              <FileList
                files={uploadedFiles}
                email={email}
                onFileDownload={(fileKey, originalFileName) =>
                  handleFileDownload(fileKey, originalFileName, setSnackbar, setDownloadProgress)
                }
                onFileDelete={(fileKey, userEmail) =>
                  handleFileDelete(
                    fileKey,
                    userEmail,
                    email,
                    setSnackbar,
                    setUploadedFiles,
                    () =>
                      fetchFiles(
                        studyId,
                        'STUDY_PAGE',
                        5,
                        currentPage,
                        lastEvaluatedKeys,
                        setUploadedFiles,
                        setLastEvaluatedKeys,
                        setTotalPages,
                        totalPages,
                        setSnackbar,
                        setIsLoading
                      ),
                    setCurrentPage
                  )
                }
                theme={theme}
              />
            )}
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </AccordionDetails>
      </Box>
    </Box>
  );
};

export default StudyDetailPage;
