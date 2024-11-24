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
import {useLocation, useParams} from "react-router-dom";
import axios from 'axios'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteIcon from '@mui/icons-material/Delete';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import bookProfileManAndSea from '/src/assets/book-profile-man-and-sea.jpg';
import PropTypes from "prop-types";


const StudyDetailPage = ({ isSmallScreen, isMediumScreen }) => {
    const location = useLocation();
    const study = location.state.study;
    const {studyId} = useParams();
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState();

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
    };

    const handleFileUpload = async () => {

    };

    const handleFileDelete = async (storedFileName) => {

    };

    const handleFileDownload = async (storedFileName, originalFileName) => {

    };


    return (
        <Box
            sx={{
                border: '1px solid',
                display: 'flex',
                flexDirection: 'column',
                // justifyContent: 'center',
                // alignItems: 'center',
                mb: 3,
                p: 2,
                gap: 2,
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    height: '20vh',
                    overflowY: 'auto',
                }}
            >
                <Box
                    component="img"
                    src={study.bookImage || bookProfileManAndSea}
                    alt={study.title}
                    sx={{
                        width: '100%',
                        objectFit: 'contain',
                        mb: 2,
                    }}
                />
            </Box>
            <Divider sx={{borderBottom: '1px solid #ddd'}} />

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
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                >
                    <Typography>공유파일 리스트</Typography>
                </AccordionSummary>
                <AccordionDetails>

                    <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
                        {/* File Upload Input */}
                        <Button
                            variant="contained"
                            component="label"
                            color="primary"
                            startIcon={<UploadFileIcon />}
                        >
                            파일 추가
                            <input
                                type="file"
                                hidden
                                onChange={handleFileChange}
                            />
                        </Button>


                    </Box>

                    {/* Selected Files Preview */}
                    {selectedFile &&  (
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
                                    <ListItemText primary={file.originalFileName}/>
                                    <ListItemText primary={file.createdAt}/>
                                    <ListItemText primary={file.fileSize}/>


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

            {/* Post Creation Modal */}
            {/*<StudyCreatgionDialog*/}
            {/*    open={isStudyModalOpen}*/}
            {/*    onClose={handleCloseStudyModal}*/}
            {/*    selectedTeamId={params.teamId}*/}
            {/*    selectedBook={book}*/}
            {/*/>*/}
        </Box>
    );
};
StudyDetailPage.propTypes = { // 노란줄 안 뜨게 하려고 배열 내부 객체에 대한 명시
    uploadedFiles: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            storedFileName: PropTypes.string.isRequired,
            originalFileName: PropTypes.string.isRequired,
            userNickname: PropTypes.string.isRequired,
            createdAt: PropTypes.string.isRequired,
            fileSize: PropTypes.number.isRequired,
        })
    ).isRequired,
};
export default StudyDetailPage;
