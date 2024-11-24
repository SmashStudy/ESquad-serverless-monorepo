import React from 'react';
import IconButton from '@mui/material/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const MessageItem = ({ message, currentUsername, onEditMessage, onDeleteMessage, onDownloadFile }) => {
    const timestamp = new Date(message.timestamp).toLocaleTimeString();

    const isImage = (url) => {
        return url && (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.endsWith('.gif'));
    };

    return (
        <div
            className="message-item"
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                padding: '0.8rem',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
                marginBottom: '1rem',
                maxWidth: '70%',
                wordBreak: 'break-word'
            }}
        >
            <span
                className="message-timestamp"
                style={{ fontSize: '0.75rem', color: '#888', marginBottom: '0.25rem', alignSelf: 'flex-end' }}
            >
                {timestamp}
            </span>
            <div
                className="message-content"
                style={{ display: 'flex', flexDirection: 'column', width: '100%' }}
            >
                <span
                    className="message-user"
                    style={{ fontWeight: 'bold', color: '#333', marginBottom: '0.3rem' }}
                >
                    {message.username || message.userId} {/* 사용자 이름 표시 */}
                </span>

                {message.message && (
                    <span className="message-text" style={{ marginBottom: '0.5rem', color: '#333' }}>
                        {message.message}
                    </span>
                )}

                {message.fileUrl && isImage(message.fileUrl) && (
                    <div className="image-preview" style={{ marginTop: '0.5rem' }}>
                        <img
                            src={message.fileUrl}
                            alt="파일 미리보기"
                            style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '8px', marginTop: '0.5rem' }}
                        />
                    </div>
                )}
            </div>

            <div
                className="message-actions"
                style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end', alignSelf: 'flex-end' }}
            >
                {message.fileUrl && (
                    <IconButton
                        color="primary"
                        size="small"
                        onClick={() => onDownloadFile(message.fileUrl)}
                        aria-label="파일 다운로드"
                        style={{ marginRight: '0.5rem' }}
                    >
                        <DownloadIcon />
                    </IconButton>
                )}

                {!message.fileUrl && (
                    <IconButton
                        color="secondary"
                        size="small"
                        onClick={() => onEditMessage(message.id, message.message)}
                        aria-label="메시지 수정"
                        style={{ marginRight: '0.5rem' }}
                    >
                        <EditIcon />
                    </IconButton>
                )}

                <IconButton
                    color="error"
                    size="small"
                    onClick={() => onDeleteMessage(message.id, message.fileUrl)}
                    aria-label="메시지 삭제"
                >
                    <DeleteIcon />
                </IconButton>
            </div>
        </div>
    );
};

export default React.memo(MessageItem);
