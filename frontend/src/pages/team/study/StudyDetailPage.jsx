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
import SnackbarAlert from "../../../components/storage/SnackBarAlert.jsx";

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
        fontWeight="bold"
        sx={{
          color: 'text.primary',
          marginLeft: '8px', // 아이콘과 텍스트 간의 간격을 설정
          fontSize: '17px'
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
        gap: 4,
        p: 4,
        backgroundColor: theme.palette.background.default,
        borderRadius: 3,
        boxShadow: 3,
        minHeight: '100%'
      }}
    >


      {/* Study Info */}
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
        {/* Study Image */}
        <Box
          component="img"
          src={study?.imgPath || 'default-image-path.jpg'}
          alt={study?.studyName}
          sx={{
            width: { md: '30vh', top: 0 },
            height: 'auto',
            borderRadius: 2,
            boxShadow: 2,
            minHeight: '40vh'
          }}
        />
        {/* Study Details */}
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" fontWeight="bold">
            {study?.studyName || 'Loading...'}
          </Typography>
          <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
            {study?.description || 'Loading...'}
          </Typography>
        </Box>
        <Box>
          <StudyStatus startDate={study?.startDate} endDate={study?.endDate} ></StudyStatus>
        </Box></Box>

      {/* 파일 시스템 영역 */}
      <Box
        sx={{
          width: '100%',
          padding: '16px',
          position: 'relative', // position: 'flex'는 유효하지 않으므로 'relative'로 수정
          boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.25)', // 그림자 추가
          borderRadius: '8px', // 선택 사항: 모서리 둥글게
          minHeight: '40vh'

        }}
      >

        <SnackbarAlert
            open={snackbar.open}
            message={snackbar.message}
            severity={snackbar.severity}
            onClose={handleSnackbarClose}
        />
        <Box aria-controls="panel1a-content" id="panel1a-header" sx={{ position: 'relative', top: 0 }}>
          <Typography sx={{ fontSize: '20px', paddingBottom: '10px' }}>공유파일 리스트</Typography>
        </Box>
        <Box >
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
          <Box sx={{ position: 'sticky', bottom: 0 }}>
            {uploadedFiles.length > 3 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default StudyDetailPage;
