import React from 'react';
import MessageItem from "./MessageItem.jsx";

const MessageList = ({ messages, username, onEditMessage, onDeleteMessage, onDownloadFile, onDeleteFile }) => {
    return (
        <div className="message-list">
            {messages
                .filter(msg => {
                    // 유효한 파일 메시지만 렌더링 (fileKey, presignedUrl, contentType 모두 유효해야 함)
                    if (msg.fileKey && (!msg.presignedUrl || !msg.contentType)) {
                        return false;  // 유효하지 않은 파일 메시지는 제외
                    }
                    return true;  // 유효한 메시지
                })
                .map((msg, index) => {
                    const key = msg.fileKey || `${msg.room_id}-${msg.timestamp}` || `fallback-${index}`;

                    return (
                        <MessageItem
                            key={key}
                            message={msg}
                            user_id={msg.user_id}
                            currentUsername={username}
                            onEditMessage={onEditMessage}
                            onDeleteMessage={onDeleteMessage}
                            onDownloadFile={onDownloadFile}
                            onDeleteFile={onDeleteFile}
                        />
                    );
            })}
        </div>
    );
};

export default MessageList;
