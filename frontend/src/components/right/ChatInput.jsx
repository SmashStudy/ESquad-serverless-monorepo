import React from 'react';
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
                       handleRemoveFile,
                       selectedFile,
                       setSelectedFile,
                       isUploading,
                       setPreviewUrl,
                   }) => {

    const handleSendClick = () => {
        if (editMessage) { onSaveMessage(); }
        else { handleSend(message); }
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);

            const previewUrl = URL.createObjectURL(file);
            setPreviewUrl(previewUrl);
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
                marginBottom: "20px"
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
