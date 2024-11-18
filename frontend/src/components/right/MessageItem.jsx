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

const MessageItem = ({ message, onEditMessage, onDeleteMessage, onDownloadFile }) => {
    const timestamp = new Date(message.timestamp).toLocaleTimeString();

    const [isEditing, setIsEditing] = useState(false);
    const [editedMessage, setEditedMessage] = useState(message.message);

    // 사용자 이니셜 추출 (예: "John Doe" -> "JD")
    const getInitials = (name) => {
        return name
            ? name.split(" ").map((word) => word[0]).join("").toUpperCase()
            : "U";
    };

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const handleSaveClick = () => {
        if (editedMessage.trim() === "") {
            alert("메시지는 비어 있을 수 없습니다.");
            return;
        }

        // 로컬 상태에서 메시지 업데이트
        message.message = editedMessage;
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
                border: '1px solid red',
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                padding: '0.8rem',
                borderRadius: '8px',
                backgroundColor: isEditing ? '#ffffff' : '#ffffff',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
                marginBottom: '1rem',
                maxWidth: '95%',
                width: '100%',
                wordBreak: 'break-word',
            }}
        >
            {/* 사용자 이름 및 Avatar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '0.8rem' }}>
                <span
                    style={{
                        fontSize: '0.85rem',
                        color: '#333',
                        fontWeight: 'bold',
                        marginBottom: '0.3rem',
                    }}
                >
                    {message.username || message.userId}
                </span>
                <Avatar sx={{ bgcolor: '#87A5CDFF' }}>
                    {getInitials(message.username)}
                </Avatar>
            </div>

            {/* 메시지 내용 */}
            <div style={{ flexGrow: 1 }}>
                <span
                    className="message-timestamp"
                    style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem' }}
                >
                    {timestamp}
                </span>
                <div
                    className="message-content"
                    style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}
                >
                    {/* 메시지 내용 표시 */}
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

                    {/* 파일 미리보기 */}
                    {message.fileUrl && (
                        <img
                            src={message.fileUrl}
                            alt="파일 미리보기"
                            style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '8px', marginTop: '0.5rem' }}
                        />
                    )}
                </div>
            </div>

            {/* 액션 버튼 영역 */}
            <div
                className="message-actions"
                style={{
                    display: 'flex',
                    gap: '8px',
                    marginLeft: 'auto',
                    alignItems: 'center',
                }}
            >
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

                        <IconButton
                            size="small"
                            onClick={handleEditClick}
                            aria-label="메시지 수정"
                            sx={{ color: '#8e24aa' }}
                        >
                            <EditIcon />
                        </IconButton>

                        <IconButton
                            size="small"
                            onClick={() => onDeleteMessage(message)}
                            aria-label="메시지 삭제"
                            sx={{ color: '#d81b60' }}
                        >
                            <DeleteIcon />
                        </IconButton>
                    </>
                )}
            </div>
        </div>
    );
};

export default React.memo(MessageItem);