import React from 'react';
import MessageItem from "./MessageItem.jsx";

const MessageList = ({ messages, username, onEditMessage, onDeleteMessage, onDownloadFile, onDeleteFile }) => {
    return (
        <div className="message-list">
            {messages.map((msg, index) => {
                const key = `${msg.room_id}-${msg.timestamp}-${msg.fileKey || 'text'}`;
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
