import React, {useState, useEffect, useRef} from 'react';
import ChatInput from "./ChatInput.jsx";
import MessageList from "./MessageList.jsx";
import {fetchMessageAPI ,sendMessageAPI , editMessageAPI, deleteMessageAPI } from "./chatApi/ChatApi.jsx";
import {uploadFile, deleteFile, fetchFiles} from "./chatApi/ChatFileApi.jsx";
import {getChatWebSocketApi, getUserApi} from "../../utils/apiConfig.js";
import axios from "axios";
import {fetchUserEmail} from "../../utils/storage/utilities.js";
import Loading from "../custom/Loading.jsx";

const wsUrl = "wss://zrmpjkuu7f.execute-api.us-east-1.amazonaws.com/local";

function ChatMessages({currentChatRoom}) {
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState("");
    const [editingMessage, setEditingMessage] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState("");
    const room_id = String (currentChatRoom?.id);
    const [email, setEmail] = useState('unknown');
    const [error, setError] = useState(null);
    const [nickname, setNickname] = useState('');
    const [loading, setLoading] = useState(true);

    const socketRef = useRef(null);
    const messageEndRef = useRef(null);
    const currentRoomIdRef = useRef(null);

    // 유저 정보 로드
    useEffect(() => {
        const fetchNickname = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await axios.get(`${getUserApi()}/get-nickname`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('jwtToken')}`,
                    },
                });
                setNickname(response.data.nickname);
            } catch (err) {
                setError('닉네임을 가져오는 중 오류가 발생했습니다.');
            } finally {
                setLoading(false);
            }
        };
        fetchUserEmail(setEmail);
        fetchNickname();
    }, []);

    useEffect(() => {
        if (!room_id || !email) return;

        setLoading(true);

        // 현재 연결된 WebSocket이 있다면 닫아줌 (중복 연결 방지)
        if (socketRef.current) {
            socketRef.current.close();
        }

        // 기존 메시지를 유지하고 새로운 채팅방에 맞는 메시지를 불러오기
        if (currentRoomIdRef.current !== room_id) {
            currentRoomIdRef.current = room_id;
            loadMessages(room_id);
            connectWebSocket(room_id);
        }

    }, [room_id, email]);


    const sortMessages = (messages) => {
        return [...messages].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    };

    // 메시지 불러오기
    const loadMessages = async (room_id) => {
        try {
            const fetchedMessages = await fetchMessageAPI(room_id);
            const fetchedFiles = await fetchFiles(room_id);

            // 유효하지 않은 파일 메시지를 필터링
            const combinedMessages = sortMessages([
                ...(fetchedMessages || []).filter(msg => !(msg.fileKey)),
                ...(fetchedFiles || []).filter(file => file.fileKey),
            ]);
            setMessages(combinedMessages);
            scrollToBottom();
        } catch (error) {
            console.error("메시지 불러오기 실패:", error.message);
        } finally {
            setLoading(false);
        }
    };

    // 웹소켓 연결 함수
    const connectWebSocket = (room_id) => {
        const encodedRoomId = encodeURIComponent(room_id);
        const encodedUserId = encodeURIComponent(email);

        const newSocket = new WebSocket(`${wsUrl}?room_id=${encodedRoomId}&user_id=${encodedUserId}`);

        newSocket.onopen = () => {};

        newSocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                // 수신한 이벤트에 따라 상태를 업데이트
                switch (data.action) {
                    case 'sendMessage':
                        setMessages((prevMessages) => [...prevMessages, data]);
                        break;

                    case 'updateMessage':
                        setMessages((prevMessages) =>
                            prevMessages.map((message) =>
                                message.timestamp === data.timestamp
                                    ? { ...message, ...data }
                                    : message
                            )
                        );
                        break;
                    case 'deleteMessage':
                        setMessages((prevMessages) =>
                            prevMessages.filter(
                                (message) => message.timestamp !== data.timestamp
                            )
                        );
                        break;
                    default:
                }
                scrollToBottom();
            } catch (error) {
                console.error("Invalid JSON received:", event.data);
            }
        };
        newSocket.onclose = () => {
            console.error("WebSocket 연결 종료");
            setTimeout(() => connectWebSocket(room_id), 3000);
        };
        socketRef.current = newSocket;
    };

    const scrollToBottom = () => {
        messageEndRef.current?.scrollIntoView({behavior: "smooth"});
    }

    // 메시지 전송 핸들러
    const sendMessage = async (messageContent) => {
        const timestamp = Date.now();

        try {
            if (selectedFile) {
                // 파일 업로드 로직
                const uploadResponse = await uploadFile({
                    file: selectedFile,
                    room_id: room_id,
                    user_id: email,
                    nickname: nickname,
                    targetType: 'CHAT',
                });

                const fileMessage = {
                    action: 'sendMessage',
                    message: `파일 업로드 완료: ${uploadResponse.originalFileName}`,
                    fileKey: uploadResponse.fileKey,
                    contentType: uploadResponse.contentType,
                    originalFileName: uploadResponse.originalFileName,
                    room_id: currentChatRoom.id,
                    user_id: email,
                    nickname: nickname,
                    timestamp: timestamp,
                    isFile: true,
                };

                // 웹소켓으로 전송
                await sendMessageAPI(socketRef, fileMessage);
                // 메시지 상태 업데이트
                setMessages((prevMessages) => [...prevMessages, fileMessage]);
                setSelectedFile(null); // 파일 선택 초기화
            } else if (editingMessage) {
                // 메시지 수정 로직
                const updatedMessage = {
                    action: 'updateMessage',
                    ...editingMessage,
                    message: messageContent,
                };

                await editMessageAPI(updatedMessage, messageContent);

                setMessages((prevMessages) =>
                    prevMessages.map((message) =>
                        message.timestamp === editingMessage.timestamp
                            ? { ...message, message: messageContent }
                            : message
                    )
                );
                setEditingMessage(null); // 수정 상태 초기화
            } else {
                const textMessage = {
                    action: "sendmessage",
                    message: messageContent,
                    room_id,
                    user_id: email,
                    nickname: nickname,
                    timestamp: timestamp
                };
                await sendMessageAPI(socketRef, textMessage);
                setMessages((prevMessages) => [...prevMessages, textMessage]);
            }
            setMessageInput(""); // 메시지 입력 초기화
            scrollToBottom();
        } catch (error) {
            console.error("메시지 전송 실패:", error.message);
        }
    };

// 메시지 수정 핸들러
    const handleEditMessage = async (timestamp, content, room_id) => {
        setEditingMessage({timestamp, content, room_id});
        setMessageInput(content);
    }

    const onSaveMessage = async () => {
        if (!editingMessage)  return;
        editMessageAPI(editingMessage, messageInput).then(() => {
            setMessages((prevMessages) =>
                prevMessages.map((message) =>
                    message.timestamp === editingMessage.timestamp
                        ? {...message, message: messageInput} : message
                )
            );
            setEditingMessage(null);
            setMessageInput("");
        })
    }

// 메시지, 파일 삭제 핸들러
    const deleteMessageHandler = async (message) => {
        try {
            // 파일 삭제가 필요한 경우
            if (message.fileKey) { await deleteFile(message.fileKey); }

            // 파일 삭제 후 메시지 삭제 API 호출
            await deleteMessageAPI({
                room_id: message.room_id,
                timestamp: Number(message.timestamp),
                message: message.message,
                fileKey: message.fileKey,
            });
            const deleteAction = {
                action: 'deleteMessage',
                room_id: message.room_id,
                timestamp: Number(message.timestamp),
            }
            socketRef.current?.send(JSON.stringify(deleteAction));
            // 로컬 상태에서 메시지 제거
            setMessages((prevMessages) =>
                prevMessages.filter(
                    (msg) => msg.timestamp !== message.timestamp
                )
            );
        } catch (error) {
            console.error("메시지 삭제 중 오류:", error.message);
        }
    };

    useEffect(() => {
        scrollToBottom();
    },[messages]);

    if (loading) { return <Loading />;}
    const handleMessageInput = (e) => { setMessageInput(e.target.value); };

    return (
        <div className="chat-messages" style={{ display: 'flex', flexDirection: 'column', height: '100%'}}>
            {/* 메시지 리스트 영역 */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                borderRadius: '8px',
                paddingBottom: '0.8rem',
                height: '400px', // 고정된 높이 설정
                maxHeight: '850px', // 최대 높이 설정
                minHeight: '400px', // 최소 높이 설정
                marginTop: '10px', // 위쪽 간격을 20px로 설정
                paddingTop: '16px'
            }}>
                <MessageList
                    messages={messages}
                    currentUser={nickname}
                    onEditMessage={handleEditMessage}
                    onDeleteMessage={deleteMessageHandler}
                    onDeleteFile={deleteMessageHandler}
                />
                <div ref={messageEndRef}/>
            </div>

            {/* 메시지 입력창 영역 */}
            <div style={{
                flexShrink: 0,
                position: 'sticky',
                bottom: 0,
                backgroundColor: '#ffffff',
                zIndex: 10,
                paddingBottom: '0px',
            }}>
                <ChatInput
                    message={messageInput}
                    onMessageChange={handleMessageInput}
                    handleSend={sendMessage}
                    editMessage={editingMessage?.timestamp}
                    onSaveMessage={onSaveMessage}
                    selectedFile={selectedFile}
                    setSelectedFile={setSelectedFile}
                    isUploading={isUploading}
                    previewUrl={previewUrl}         // 전달
                    setPreviewUrl={setPreviewUrl}
                    handleRemoveFile={deleteMessageHandler} // 이 부분 확인
                />
            </div>
            <input
                type="file"
                id="fileInput"
                style={{ display: 'none' }}
                onChange={(e) => setSelectedFile(e.target.files[0])}
            />
        </div>
    );
}
export default ChatMessages;