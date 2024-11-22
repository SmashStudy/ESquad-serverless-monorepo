import React from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';

const ChatInput = ({
                       message,
                       onMessageChange,
                       handleSend,
                       onSaveMessage,
                       editMessage,
                       handleUploadClick,
                       handleRemoveFile,
                       selectedFile,
                   }) => {
    const handleSendClick = () => {
        if (editMessage) {
            onSaveMessage();
        } else {
            handleSend(message);
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
            {selectedFile ? (
                <Box sx={{ display: 'flex', alignItems: 'center', marginRight: '8px' }}>
                    <IconButton color="error" onClick={handleRemoveFile}>
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

            <IconButton color="primary" onClick={handleSendClick}>
                <SendIcon />
            </IconButton>

            <IconButton color="success" onClick={handleUploadClick}>
                <AttachFileIcon />
            </IconButton>
        </Box>
    );
};

export default ChatInput;
