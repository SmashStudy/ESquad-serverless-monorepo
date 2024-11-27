import React, {useState} from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import CircularProgress from '@mui/material/CircularProgress';
import FilePreview from "./components/FilePreview.jsx";

const ChatInput = ({
                       message,
                       onMessageChange,
                       handleSend,
                       onSaveMessage,
                       editMessage,
                       handleUploadClick,
                       handleRemoveFile,
                       selectedFile,
                       setSelectedFile,
                       isUploading,
                       setPreviewUrl,
                   }) => {

    const handleSendClick = () => {
        if (editMessage) {
            onSaveMessage();
        } else {
            handleSend(message);
        }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
            // 로컬 미리보기 URL 생성
            const previewUrl = URL.createObjectURL(file);
            setPreviewUrl(previewUrl);

            // 파일 업로드를 트리거 (onUploadClick 호출 또는 사전 처리 로직 추가)
            try {
                const uploadedFile = await handleUploadClick(file); // 파일 업로드 수행
                if (uploadedFile && uploadedFile.presignedUrl) {
                    setPreviewUrl(uploadedFile.presignedUrl); // 업로드 성공 시 presignedUrl로 업데이트
                }
            } catch (error) {
                console.error("파일 업로드 실패:", error.message);
                setPreviewUrl(null); // 실패 시 초기화
            }
        }
    };

    const handleRemoveFileClick = async () => {
        try {
            if (selectedFile) {
                await handleRemoveFile({ fileKey: selectedFile.fileKey});
                setSelectedFile(null);  // 로컬 상태에서 파일 선택 해제
                setPreviewUrl(null);
            }
        } catch (error) {
            console.error("파일 삭제 실패:", error.message);
        }
    };

    return (
        <Box
            display="flex"
            alignItems="center"
            sx={{
                padding: '0.6rem',
                backgroundColor: '#f9fafb',
                borderRadius: '12px',
                boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
            }}
        >
            {/* 파일 업로드 진행 상태 */}
            {isUploading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                    <CircularProgress size={24} color="secondary" />
                </Box>
            ) : selectedFile ? (
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginRight: '8px',
                    }}
                >
                    {/* 미리보기 컴포넌트 */}
                    <FilePreview file={selectedFile} />
                    <IconButton color="error" onClick={handleRemoveFileClick}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            ) : (
                <TextField
                    variant="filled"
                    placeholder="Input message here! :D"
                    value={message}
                    onChange={onMessageChange}
                    fullWidth
                />
            )}

            {/* 파일 첨부 아이콘 */}
            <IconButton color="success" component="label">
                <AttachFileIcon />
                <input type="file" hidden onChange={handleFileChange} />
            </IconButton>

            {/* 메시지 전송 아이콘 */}
            <IconButton color="primary" onClick={handleSendClick}>
                <SendIcon />
            </IconButton>
        </Box>
    );
};

export default ChatInput;
