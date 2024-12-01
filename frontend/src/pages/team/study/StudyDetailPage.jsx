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
import usePresignedUrl from '../../../hooks/storage/UsePresignedUrl.jsx';
import {
  fetchFiles,
  fetchUserEmail,
  handleFileUpload,
  handleFileDelete,
  handleFileDownload
} from '../../../utils/storage/utilities.js';

const StudyDetailPage = ({isSmallScreen, isMediumScreen}) => {
  const location = useLocation();
  const study = location.state.study;
  const theme = useTheme();
  const {studyId} = useParams();
  const {requestPresignedUrl} = usePresignedUrl();

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
        setSnackbar,
        setIsLoading
    );
    fetchUserEmail(setEmail);
  }, [studyId, currentPage]);

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
            border: '1px solid',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            mb: 3,
            p: 2,
            gap: 2
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
                                setSnackbar,
                                setIsLoading
                            ),
                        setCurrentPage
                    )
                }
                isUploading={isUploading}
            />
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
                        handleFileDownload(fileKey, originalFileName, setSnackbar)
                    }
                    onFileDelete={(fileKey, userEmail) =>
                        handleFileDelete(
                            fileKey,
                            userEmail,
                            email,
                            requestPresignedUrl,
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
                                    setSnackbar,
                                    setIsLoading
                                ),
                            setCurrentPage
                        )
                    }

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
  );
};

export default StudyDetailPage;
