import React from 'react';
import MessageItem from "./MessageItem.jsx";

const MessageList = ({ messages, currentUser, onEditMessage, onDeleteMessage, onDownloadFile, onDeleteFile }) => {
    return (
        <div className="message-list">
            {messages.map((msg, index) => {
                const key = `${msg.room_id}-${msg.timestamp}-${msg.fileKey || 'text'}`;
                return (
                    <MessageItem
                        key={key}
                        message={msg}
                        currentUser={currentUser}
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
