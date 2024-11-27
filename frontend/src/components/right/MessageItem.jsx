import React, {useEffect, useState} from 'react';
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
import {deleteFile, downloadFile} from "./chatApi/chatFileApi.jsx";
import { getPresignedUrl} from "./chatApi/ChatUtils.jsx";

const MessageItem = ({ message, onEditMessage, onDeleteMessage, onDownloadFile }) => {
    const theme = useTheme();
    const isFileMessage = message.fileKey && message.contentType && message.presignedUrl;
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editedMessage, setEditedMessage] = useState(message.message);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (isFileMessage && !message.presignedUrl) {
            const fetchPresignedUrl = async () => {
                try {
                    const url = await getPresignedUrl(message.fileKey);
                    setPreviewUrl(url);
                } catch (error) {
                    console.error("Failed to fetch presigned URL for preview:", error);
                }
            };
            fetchPresignedUrl();
        } else {
            setPreviewUrl(message.presignedUrl);
        }
    }, [message.fileKey, message.presignedUrl, isFileMessage]);

    const getInitials = (name) => {
        return name ? name.split(" ").map((word) => word[0]).join("").toUpperCase() : "U";
    };

    const getAvatarColor = (username) => {
        const colors =
            ['#FF80AB', '#FF8A80', '#EA80FC', '#8C9EFF',
                '#80D8FF', '#A7FFEB', '#CCFF90', '#FFD180',
                '#e57373', '#f06292', '#ba68c8', '#7986cb',
                '#64b5f6', '#4fc3f7', '#4dd0e1', '#4db6ac',
                '#81c784', '#aed581', '#dce775', '#fff176',
                '#ffd54f', '#ffb74d', '#ff8a65', '#a1887f'];
        const index = username ? username.charCodeAt(0) % colors.length : 0;
        return colors[index];
    };

    const handleEditClick = () => { setIsEditing(true); };

    const handleSaveClick = () => {
        onEditMessage(message.timestamp, editedMessage, message.room_id);
        setIsEditing(false);
    };

    const handleCancelClick = () => {
        setEditedMessage(message.message);
        setIsEditing(false);
    };

    const handleDeleteClick = async () => {
        try {
            if (isFileMessage && message.fileKey) {
                await deleteFile(message.fileKey);
            }
            // 파일 삭제 이후 메시지 삭제 핸들러 호출
            onDeleteMessage(message);
        } catch (error) {
            console.error("삭제 실패:", error.message);
        }
    };

    const handleDownloadFile = async () => {
        try {
            if (message.fileKey)
            await downloadFile(message.fileKey, message.originalFileName);
        } catch (error) {
            console.error("파일 다운로드 실패:", error.message);
        }
    };

    const handleDeleteFile = async () => {
        try {
            if (!message.fileKey) {
                throw new Error("파일 키가 누락되었습니다.");
            }
            await deleteFile(message.fileKey);
            // 부모 컴포넌트에서 메시지 리스트 갱신
            onDeleteMessage(message);
        } catch (error) {
            console.error("파일 삭제 실패:", error.message);
        }
    };

    return (
        <div
            className="message-item"
            style={{
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
            {/* 아바타 및 유저 정보 */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '0.8rem' }}>
                <span style={{ fontSize: '0.85rem', color: '#333', fontWeight: 'bold', marginBottom: '0.3rem' }}>
                    {message.username || message.userId}
                </span>
                <Avatar sx={{ bgcolor: getAvatarColor(message.username) }}>
                    {getInitials(message.username)}
                </Avatar>
            </div>

            {/* 메시지 내용 */}
            <div style={{ flexGrow: 1 }}>
                <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem' }}>
                    {new Date(message.timestamp).toLocaleTimeString()}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                    {isEditing ? (
                        <TextField
                            value={editedMessage}
                            onChange={(e) => setEditedMessage(e.target.value)}
                            fullWidth
                            variant="outlined"
                            size="small"
                        />
                    ) : (
                        <>
                            {isFileMessage ? (
                                <FilePreviewComponent fileKey={message.fileKey} contentType={message.contentType} presignedUrl={message.presignedUrl} />
                            ) : (
                                <span style={{ marginBottom: '0.5rem', color: '#333' }}>{message.message}</span>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* 메시지 액션 버튼 */}
            <div
                className="message-actions"
                style={{ display: 'flex', gap: '8px', marginLeft: 'auto', alignItems: 'center' }}
            >
                {isFileMessage ? (
                    // 파일 메시지: 다운로드 & 삭제 버튼
                    <>
                        <IconButton color="primary" size="small" onClick={handleDownloadFile} aria-label="파일 다운로드" disabled={isProcessing}>
                            <DownloadIcon />
                        </IconButton>
                        <IconButton size="small" onClick={handleDeleteFile} aria-label="삭제" sx={{ color: '#d81b60' }}>
                            <DeleteIcon />
                        </IconButton>
                    </>
                ) : isEditing ? (
                    // 텍스트 수정 중: 저장 & 취소 버튼
                    <>
                        <IconButton size="small" onClick={handleSaveClick} sx={{ color: '#43a047' }}>
                            <CheckIcon />
                        </IconButton>
                        <IconButton size="small" onClick={handleCancelClick} sx={{ color: pink[500] }}>
                            <CloseIcon />
                        </IconButton>
                    </>
                ) : (
                    // 텍스트 메시지: 수정 & 삭제 버튼
                    <>
                        <IconButton size="small" onClick={handleEditClick} aria-label="메시지 수정" sx={{ color: '#8e24aa' }}>
                            <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={handleDeleteClick} aria-label="삭제" sx={{ color: '#d81b60' }}>
                            <DeleteIcon />
                        </IconButton>
                    </>
                )}
            </div>
        </div>
    );
};

export default React.memo(MessageItem);
