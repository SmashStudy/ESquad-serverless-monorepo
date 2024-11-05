import React, { useState, useEffect } from 'react';
import { useUser } from "../form/UserContext.jsx";
import { fetchMessage, sendMessage, editChatMessage, deleteMessage } from "./chatApi/ChatApi.jsx";
import { fileUpload, fileDelete } from "./chatApi/ChatFileApi.jsx";
import ChatInput from "./ChatInput.jsx";
import MessageList from "./MessageList.jsx";
import FilePreviewComponent from "./components/FilePreviewComponent.jsx";

const ChatMessages = ({ currentChatRoom }) => {
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [editMessageId, setEditMessageId] = useState(null);
    const [editMessage, setEditMessage] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState("");

    // const { userInfo } = useUser();
    // const userId = userInfo ? userInfo.id : "";
    // const username = userInfo ? userInfo.username : "";

    const userInfo = { id: 28, username: "esquadback"}  // 더미 유저
    const userId = userInfo.id;              // 더미 유저
    const username = userInfo.username;   // 더미 유저
    const roomId = currentChatRoom.id;

    // 메시지를 불러오는 함수
    const loadMessages = async () => {

    };

    // useEffect(() => {
    //     loadMessages();
    //     const intervalId = setInterval(loadMessages, 3000); // 3초마다 메시지 업데이트
    //     return () => clearInterval(intervalId);
    // }, [roomId]);

    // 메시지 전송 핸들러
    const handleSendMessage = async (messageText, file) => {

    };

    // 메시지 수정 핸들러
    const handleEditMessageFunc = (id, currentMessage) => {

    };

    // 메시지 수정 저장 핸들러
    const handleSaveEditMessage = async () => {

    };

    // 메시지 삭제 핸들러
    const handleDeleteMessageFunc = async (id, fileUrl) => {

    };

    // 파일 다운로드 핸들러
    const handleDownloadFile = async (fileUrl) => {

    };

    // 파일 선택 핸들러
    const handleFileChange = (e) => {

    };

    // 파일 업로드 클릭 핸들러
    const handleUploadClick = () => {
        document.getElementById('fileInput').click();
    };

    // 파일 제거 핸들러
    const handleRemoveFile = () => {
        setSelectedFile(null);
        setMessage((prevMessage) => prevMessage.replace(/\s*\[파일: .+?\]/, ''));
    };

    return (
        <div className="chat-container">
            {console.log('현재 메시지 목록:', messages)} {/* 추가된 로그 */}
            <MessageList
                messages={messages}
                userId={userId}
                username={username}
                onEditMessage={handleEditMessageFunc}
                onDeleteMessage={handleDeleteMessageFunc}
                onDownloadFile={handleDownloadFile}
            />
            <ChatInput
                message={editMessageId ? editMessage : message}
                onMessageChange={(e) => {
                    const newMessage = e.target.value;
                    if (editMessageId) {
                        setEditMessage(newMessage);
                    } else {
                        setMessage(newMessage);
                    }
                }}
                handleSend={(messageText) => handleSendMessage(messageText, selectedFile)}
                onSaveMessage={handleSaveEditMessage}
                editMessageId={editMessageId}
                userId={userId}
                handleUploadClick={handleUploadClick}
                handleRemoveFile={handleRemoveFile}
            />
            <input
                type="file"
                id="fileInput"
                style={{ display: 'none' }}
                onChange={handleFileChange}
            />
            {previewUrl && <FilePreviewComponent file={selectedFile} />}
        </div>
    );
};

export default ChatMessages;
