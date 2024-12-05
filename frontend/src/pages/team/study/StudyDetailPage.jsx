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
import FileUploader from '../../../components/storage/FileUploader.jsx';
import FileList from '../../../components/storage/FileList.jsx';
import Pagination from '../../../components/storage/Pagination.jsx';
import SnackbarAlert from '../../../components/storage/SnackBarAlert.jsx';
import {useTheme} from '@mui/material';
import {
  fetchFiles,
  fetchUserEmail,
  handleFileUpload,
  handleFileDelete,
  handleFileDownload
} from '../../../utils/storage/utilities.js';
import LinearProgressWithLabel from "../../../components/custom/CustomMui.jsx";
import FilePreviewBeforeUpload
  from "../../../components/storage/FilePreviewBeforeUpload.jsx";

const StudyDetailPage = ({isSmallScreen, isMediumScreen}) => {
  const location = useLocation();
  const study = location.state?.study;
  const theme = useTheme();

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
    if (study) {
      fetchFiles(
        study.PK,
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
    }
    fetchUserEmail(setEmail);
  }, [currentPage, study]);

  const handleSnackbarClose = () => {
    setSnackbar({...snackbar, open: false});
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
        border: '1px solid',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        mb: 3,
        p: 2,
        gap: 2,
        height: '100%',
        position:'relative'
      }}
    >
      {/* Image */}
      <Box
        sx={{
          width: '100%',
          height: '20vh',
          minHeight:'20vh',
          overflowY: 'auto',
          top: 0,
          left: 0,
        }}
      >
        <Box
          component="img"
          src={
            study?.imgPath ||
            'https://s3-esquad-public.s3.us-east-1.amazonaws.com/book-profile-man-and-sea-lJaouK3e.jpg'
          }
          alt={study?.studyName}
          sx={{ width: '100%', objectFit: 'contain',}}
        />
      </Box>
      
      {/* study Info */}
      <Box sx={{ 
        width: '100%',
        padding: '16px',
        top: 0
        }}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          {study?.studyName || 'Loading...'}
        </Typography>
      </Box>
      
      {/* file */}
      <Box sx={{ 
        width: '100%',
        padding: '16px',
        }}>
        <Accordion>
          <AccordionSummary
              expandIcon={<ExpandMoreIcon/>}
              aria-controls="panel1a-content"
              id="panel1a-header"
          >
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

            {selectedFile !== null && (
                <FilePreviewBeforeUpload
                    file={selectedFile}
                />
            )}

            {downloadProgress && (
                <Box sx={{my: 2, alignItems: 'center'}}>
                  <Typography variant="subtitle1" sx={{mr: 2}}>
                    다운로드 중... {downloadProgress.fileName}
                  </Typography>
                  <Box sx={{flexGrow: 1}}>
                    <LinearProgressWithLabel variant="determinate"
                                             value={downloadProgress.percent}/>
                  </Box>
                </Box>
            )}

            {uploadProgress && (
                <Box sx={{my: 2, alignItems: 'center'}}>
                  <Typography variant="subtitle1" sx={{mr: 2}}>
                    업로드 중... {uploadProgress.fileName}
                  </Typography>
                  <Box sx={{flexGrow: 1}}>
                    <LinearProgressWithLabel variant="determinate"
                                             value={uploadProgress.percent}/>
                  </Box>
                </Box>
            )}

            {isLoading ? (
                <Typography
                    variant="h5"
                    sx={{
                      color: `${theme.palette.primary.main}`,
                      textAlign: 'center'
                    }}
                >
                  <CircularProgress size={"3rem"}/>
                  <br/>
                  로딩 중...
                </Typography>
            ) : (
                <FileList
                    files={uploadedFiles}
                    email={email}
                    onFileDownload={(fileKey, originalFileName) =>
                        handleFileDownload(fileKey, originalFileName,
                            setSnackbar, setDownloadProgress)
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
                    } theme={theme}

                />
            )}
            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
            />
          </AccordionDetails>
        </Accordion>
      </Box>
           
      {/* Warning */}
      <SnackbarAlert
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={handleSnackbarClose}
      />
    </Box>
  );
};

export default StudyDetailPage;
