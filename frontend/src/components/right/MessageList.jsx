import React from 'react';
import MessageItem from "./MessageItem.jsx";

const MessageList = ({ messages, username, onEditMessage, onDeleteMessage, onDownloadFile }) => {
    // console.log("MessageList : ", messages);
    return (
        <div className="message-list">
            {messages.map((msg, index) => {
                const key = (msg.room_id && msg.timestamp) ? `${msg.room_id}-${msg.timestamp}` : `fallback-${index}-${Date.now()}`;

                return (
                    <MessageItem
                        key={key}  // key를 고유하게 설정
                        message={msg}
                        userId={msg.userId}
                        currentUsername={username}
                        onEditMessage={onEditMessage}
                        onDeleteMessage={onDeleteMessage}
                        onDownloadFile={onDownloadFile}
                        fileUrl={msg.fileUrl}
                    />
                );
            })}
        </div>
    );
};

export default MessageList;
