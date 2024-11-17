import React from 'react';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import DownloadIcon from '@mui/icons-material/Download';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const MessageItem = ({ message, onEditMessage, onDeleteMessage, onDownloadFile }) => {
    const timestamp = new Date(message.timestamp).toLocaleTimeString();

    // 사용자 이름에서 이니셜 추출 (예: "John Doe" -> "JD")
    const getInitials = (name) => {
        return name
            ? name.split(" ").map((word) => word[0]).join("").toUpperCase()
            : "U";
    };

    return (
        <div
            className="message-item"
            style={{
                display: 'flex',
                flexDirection: 'row', // 가로 배치
                alignItems: 'flex-start',
                padding: '0.8rem',
                borderRadius: '8px',
                backgroundColor: '#f9f9f9',
                boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
                marginBottom: '1rem',
                maxWidth: '70%',
                wordBreak: 'break-word',
            }}
        >
            {/* Avatar 컴포넌트 추가 */}
            <Avatar sx={{ bgcolor: '#3f51b5', marginRight: '0.8rem' }}>
                {getInitials(message.username || message.userId)}
            </Avatar>

            <div style={{ flex: 1 }}>
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
                        {message.username || message.userId}
                    </span>

                    {message.message && (
                        <span className="message-text" style={{ marginBottom: '0.5rem', color: '#333' }}>
                            {message.message}
                        </span>
                    )}

                    {message.fileUrl && (
                        <img
                            src={message.fileUrl}
                            alt="파일 미리보기"
                            style={{ maxWidth: '150px', maxHeight: '150px', borderRadius: '8px', marginTop: '0.5rem' }}
                        />
                    )}
                </div>

                <div
                    className="message-actions"
                    style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'flex-end' }}
                >
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
                        color="secondary"
                        size="small"
                        onClick={() => onEditMessage(Number(message.timestamp), message.message, String(message.room_id))}
                        aria-label="메시지 수정"
                    >
                        <EditIcon />
                    </IconButton>

                    <IconButton
                        color="error"
                        size="small"
                        onClick={() => onDeleteMessage(message)}
                        aria-label="메시지 삭제"
                    >
                        <DeleteIcon />
                    </IconButton>
                </div>
            </div>
        </div>
    );
};

export default React.memo(MessageItem);
