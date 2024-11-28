import React, { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import TextField from '@mui/material/TextField';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import { pink } from '@mui/material/colors';
import { useMediaQuery, useTheme } from '@mui/material';
import FilePreviewComponent from "./components/FilePreviewComponent.jsx";
import {deleteFile, downloadFile} from "./chatApi/ChatFileApi.jsx";
import { getPresignedUrl} from "./chatApi/ChatUtils.jsx";

const MessageItem = ({ message, onEditMessage, onDeleteMessage, onDownloadFile }) => {
    const timestamp = new Date(message.timestamp).toLocaleTimeString();
    const theme = useTheme();
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));

    const [isEditing, setIsEditing] = useState(false);
    const [editedMessage, setEditedMessage] = useState(message.message);

    const getInitials = (name) => {
        return name ? name.split(" ").map((word) => word[0]).join("").toUpperCase() : "U";
    };

    const getAvatarColor = (username) => {
        const colors =
               ['#FF80AB','#FF8A80','#EA80FC','#8C9EFF',
                '#80D8FF','#A7FFEB', '#CCFF90','#FFD180',
                '#e57373','#f06292','#ba68c8','#7986cb',
                '#64b5f6','#4fc3f7','#4dd0e1','#4db6ac',
                '#81c784','#aed581','#dce775','#fff176',
                '#ffd54f','#ffb74d','#ff8a65','#a1887f'];
        const index = username ? username.charCodeAt(0) % colors.length : 0;
        return colors[index];
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = () => {
        onEditMessage(message.timestamp, editedMessage, message.room_id);
        setIsEditing(false);
    };

    const handleCancelClick = () => {
        setEditedMessage(message.message);
        setIsEditing(false);
    };

    return (
        <div
            className="message-item"
            style={{
                // border: '1px solid red',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: isSmallScreen ? '0.4rem' : '0.8rem',
                borderRadius: '8px',
                backgroundColor: isEditing ? '#ffffff' : '#ffffff',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
                marginBottom: '1rem',
                maxWidth: isSmallScreen ? '100%' : '95%',
                width: '100%',
                wordBreak: 'break-word',
            }}
        >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '0.8rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#333', fontWeight: 'bold', marginBottom: '0.3rem' }}>
                    {message.username || message.userId}
                </span>
                <Avatar sx={{ bgcolor: getAvatarColor(message.username) }}>
                    {getInitials(message.username)}
                </Avatar>
            </div>

            <div style={{ flexGrow: 1 }}>
                <span className="message-timestamp" style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem' }}>
                    {timestamp}
                </span>
                <div className="message-content" style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    {isEditing ? (
                        <TextField
                            fullWidth
                            variant="outlined"
                            value={editedMessage}
                            onChange={(e) => setEditedMessage(e.target.value)}
                            sx={{ marginBottom: '0.5rem' }}
                        />
                    ) : (
                        <span className="message-text" style={{ marginBottom: '0.5rem', color: '#333' }}>
                            {message.message}
                        </span>
                    )}
                </div>
            </div>

            <div className="message-actions" style={{ display: 'flex', gap: '8px', marginLeft: 'auto', alignItems: 'center' }}>
                {isEditing ? (
                    <>
                        <IconButton size="small" onClick={handleSaveClick} sx={{ color: "#43a047" }}>
                            <CheckIcon />
                        </IconButton>
                        <IconButton size="small" onClick={handleCancelClick} sx={{ color: pink[500] }}>
                            <CloseIcon />
                        </IconButton>
                    </>
                ) : (
                    <>
                        {message.fileUrl && (
                            <IconButton
                                color="primary"
                                size="small"
                                onClick={() => onDownloadFile(message.fileUrl)}
                                aria-label="파일 다운로드"
                            >
                                <DownloadIcon />
                            </IconButton>
                        )}
                        <IconButton size="small" onClick={handleEditClick} aria-label="메시지 수정" sx={{ color: '#8e24aa' }}>
                            <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => onDeleteMessage(message)} aria-label="메시지 삭제" sx={{ color: '#d81b60' }}>
                            <DeleteIcon />
                        </IconButton>
                    </>
                )}
            </div>
        </div>
    );
};

export default React.memo(MessageItem);
