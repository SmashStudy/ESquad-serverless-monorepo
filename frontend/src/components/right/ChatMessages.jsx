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
    const userId = 23;              // 더미 유저
    const username = 'esquadback';  // 더미 유저
    const roomId = currentChatRoom.id;

    // 메시지를 불러오는 함수
    const loadMessages = async () => {
        const fetchedMessages = await fetchMessage(roomId);
        const updatedMessages = fetchedMessages.map((msg) => {
            const savedFileUrl = localStorage.getItem(`file_${msg.id}`);
            return savedFileUrl ? { ...msg, fileUrl: savedFileUrl } : msg;
        });
        setMessages(updatedMessages);
    };

    useEffect(() => {
        loadMessages();
        const intervalId = setInterval(loadMessages, 3000); // 3초마다 메시지 업데이트
        return () => clearInterval(intervalId);
    }, [roomId]);

    // 메시지 전송 핸들러
    const handleSendMessage = async (messageText, file) => {
        if (messageText.trim() === "" && !file) return;

        let fileUrl = null;
        if (file) {
            const uploadResponse = await fileUpload(file, userId, "CHAT");
            if (uploadResponse && uploadResponse.storedFileName) {
                fileUrl = `http://localhost:8080/api/files/${uploadResponse.storedFileName}`;
            } else {
                console.error("파일 업로드 실패:", uploadResponse);
                return;
            }
        }

        const messageData = {
            userId,
            username, // 사용자 이름 추가
            message: file ? "" : messageText,
            roomId,
            ...(fileUrl && { fileUrl }),
        };

        const sendResponse = await sendMessage(messageData);

        if (!sendResponse || sendResponse.status !== "success") {
            console.error('메시지 전송 실패:', sendResponse);
            alert("메시지 전송에 실패했습니다.");
            return;
        }

        const messageId = sendResponse.messageId || sendResponse.data.messageId;
        if (!messageId) {
            console.error("메시지 ID가 없습니다:", sendResponse);
            return;
        }

        // 새로운 메시지를 messages 상태에 추가합니다.
        const newMessage = {
            ...messageData,
            id: messageId,
            timestamp: new Date().toISOString(),
        };

        console.log('새로운 메시지:', newMessage); // 추가된 로그

        setMessages((prevMessages) => {
            const updatedMessages = [...prevMessages, newMessage];
            localStorage.setItem("chatMessages", JSON.stringify(updatedMessages));
            return updatedMessages;
        });

        // 상태 초기화
        setMessage(""); // 메시지 입력 필드를 초기화
        setSelectedFile(null); // 선택한 파일 초기화
        setPreviewUrl(""); // 미리보기 URL 초기화
    };

    // 메시지 수정 핸들러
    const handleEditMessageFunc = (id, currentMessage) => {
        setEditMessageId(id);
        setEditMessage(currentMessage);
    };

    // 메시지 수정 저장 핸들러
    const handleSaveEditMessage = async () => {
        if (editMessage.trim() === "") return;

        const response = await editChatMessage(roomId, editMessageId, { newMessage: editMessage, userId });
        console.log('수정 응답:', response); // 추가된 로그

        if (response && response.status === "success") {
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg.id === editMessageId ? { ...msg, message: editMessage } : msg
                )
            );
            setEditMessageId(null);
            setEditMessage("");
        } else {
            console.error('메시지 수정 실패:', response);
            alert("메시지 수정에 실패했습니다.");
        }
    };

    // 메시지 삭제 핸들러
    const handleDeleteMessageFunc = async (id, fileUrl) => {
        const response = await deleteMessage(roomId, id, userId);
        console.log('삭제 응답:', response); // 추가된 로그

        if (response && response.status === "success") {
            setMessages((prevMessages) => prevMessages.filter((msg) => msg.id !== id));

            if (fileUrl) {
                const filename = fileUrl.split('/').pop();
                const deleteResponse = await fileDelete(filename);
                if (deleteResponse) {
                    console.log('파일 삭제 성공:', deleteResponse);
                } else {
                    console.error('파일 삭제 실패');
                }
            }
        } else {
            console.error('메시지 삭제 실패:', response);
            alert("메시지 삭제에 실패했습니다.");
        }
    };

    // 파일 다운로드 핸들러
    const handleDownloadFile = async (fileUrl) => {
        const filename = fileUrl.split('/').pop();
        try {
            const response = await fetch(fileUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/octet-stream',
                },
            });

            if (!response.ok) {
                throw new Error("파일 다운로드 실패");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", filename);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);

            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error("파일 다운로드 중 오류 발생:", error);
        }
    };

    // 파일 선택 핸들러
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);

        if (file) {
            if (file.type.startsWith("image/")) {
                const filePreviewUrl = URL.createObjectURL(file);
                setPreviewUrl(filePreviewUrl);
                setMessage("");
            } else {
                setPreviewUrl(null);
                setMessage(prevMessage => prevMessage.replace(/\s*\[파일: .+?\]/, ''));
            }

            setMessage(prevMessage => {
                const newMessage = prevMessage.replace(/\s*\[파일: .+?\]/, '');
                const fileTag = `[file: ${file.name}]`;
                return newMessage + fileTag;
            });
        }
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
