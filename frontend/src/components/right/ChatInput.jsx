import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import FilePreviewComponent from './components/FilePreviewComponent.jsx';
import { fileUpload } from "./chatApi/ChatFileApi.jsx";

const ChatInput = ({
                       message,
                       onMessageChange,
                       userId,
                       handleUploadClick,
                       editMessageId,
                       onSaveMessage,
                       handleSend,
                       handleRemoveFile,
                       selectedFile,
                       handleSendMessage,
                       targetId
                   }) => {
    const handleSendClick = async () => {
        if (selectedFile) {
            const uploadResponse = await fileUpload(selectedFile, targetId);
            if (uploadResponse) {
                handleSend('');
                onMessageChange({ target: { value: '' } });
            } else {
                alert("파일 업로드 실패");
            }
        } else if (message.trim()) {
            if (editMessageId) {
                onSaveMessage();
            } else {
                handleSend(message, null);
            }
        } else {
            alert("메시지를 입력해주세요.");
        }
    };

    return (
        <Box
            display="flex"
            alignItems="center"
            sx={{
                flexDirection: 'row',
                padding: '0.6rem',
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
                marginTop: '1rem'
            }}
        >
            {selectedFile ? (
                <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                    <FilePreviewComponent file={selectedFile} />
                    <IconButton color="error" onClick={handleRemoveFile} aria-label="파일 제거" sx={{ marginLeft: '4px' }}>
                        <CloseIcon />
                    </IconButton>
                </Box>
            ) : (
                <TextField
                    hiddenLabel
                    id="filled-hidden-label-normal"
                    variant="filled"
                    placeholder="Enter your message here..."
                    value={message}
                    onChange={onMessageChange}
                    disabled={!userId}
                    fullWidth
                    sx={{
                        backgroundColor: '#e5e7eb',
                        borderRadius: '4px',
                        '& .MuiInputBase-input': {
                            color: '#000000', // 텍스트를 검은색으로 설정
                            padding: '0.8rem',
                        },
                        '& .MuiInputBase-input::placeholder': {
                            color: '#000000', // 플레이스홀더 텍스트도 검은색으로 설정
                            opacity: 0.6,
                        },
                        marginRight: '8px'
                    }}
                />
            )}
            <IconButton color="success" onClick={handleUploadClick} disabled={!userId} aria-label="파일 업로드">
                <AttachFileIcon />
            </IconButton>

            <IconButton
                color="primary"
                onClick={handleSendClick}
                className="send-button"
                disabled={!userId}
                aria-label={editMessageId ? "메시지 저장" : "메시지 전송"}
                sx={{ marginLeft: '8px' }}
            >
                <SendIcon />
            </IconButton>
        </Box>
    );
};

export default ChatInput;
