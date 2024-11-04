import React from 'react';
import MessageItem from "./MessageItem.jsx";

const MessageList = ({ messages, userId, username, onEditMessage, onDeleteMessage, onDownloadFile }) => {
    return (
        <div className="message-list">
            {messages.map((msg) => (
                <MessageItem
                    key={msg.id}
                    message={msg}
                    userId={userId}
                    currentUsername={username}
                    onEditMessage={onEditMessage}
                    onDeleteMessage={onDeleteMessage}
                    onDownloadFile={onDownloadFile}
                    fileUrl={msg.fileUrl}
                />
            ))}
        </div>
    );
};

export default MessageList;
