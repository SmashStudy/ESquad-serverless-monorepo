import React, {useState, useEffect} from 'react';
import ChatInput from "./ChatInput.jsx";
import MessageList from "./MessageList.jsx";
import MessageItem from "./MessageItem.jsx";
import {fetchMessageAPI ,sendMessageAPI , editMessageAPI, deleteMessageAPI } from "./chatApi/ChatApi.jsx";

// import { useUser } from "../form/UserContext.jsx";

const wsUrl = "wss://rkp3d3pdq7.execute-api.us-east-1.amazonaws.com/dev";

function ChatMessages({currentChatRoom}) {
    const [messages, setMessages] = useState([]);
    const [socket, setSocket] = useState(null);
    const [messageInput, setMessageInput] = useState("");
    const [editingMessage, setEditingMessage] = useState(null);

    // 유저 더미 데이터
    const userInfo = { id: 28, username: "esquadback"}  // 더미 유저
    const userId = String(userInfo.id);              // 더미 유저
    const username = userInfo.username;   // 더미 유저
    const room_id = String(currentChatRoom?.id);

    // websocket 연결 및 메시지 수신
    useEffect(() => {
        if(currentChatRoom && room_id) {
            connectWebSocket(room_id);
        }
        return () => {
            if(socket) { socket.close(); }
        }
    }, [currentChatRoom]);

    // 메시지 불러오기
    const loadMessages = async (room_id) => {
        try {
            const messages = await fetchMessageAPI(room_id);
            setMessages(messages);
        } catch (error) {
            console.error("메시지 불러오기 실패: " + error.messages);
        }
    };

    // 웹소켓 연결 함수
    const connectWebSocket = (room_id) => {
        const newSocket = new WebSocket(`${wsUrl}?room_id=${room_id}&user_id=${userId}`);
        setSocket(newSocket);

        newSocket.onopen = () => {
            loadMessages(room_id);
        };

        newSocket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
            } catch (error) {
                console.error("Invalid JSON received: " + event.data);
            }
        };

        newSocket.onclose = () => {

        }
    }

    // 메시지 전송 핸들러
    const sendMessage = async (messageContent) => {
        const timestamp = new Date().getTime();
        if(!room_id) {
            alert("채팅방이 선택되지 않음");
            return;
        }
        const messageData = {
            action: "sendmessage",
            message: messageContent,
            room_id,
            userId: userId,
            timestamp
            // username,
        };

        sendMessageAPI(socket, messageData);

            if(editingMessage) {
                setMessages((prevMessages) =>
                    prevMessages.map((message) =>
                        message.timestamp === editingMessage.timestamp
                            ? {... message, message: messageContent} : message
                    )
                );
                setEditingMessage(null);
            } else {
                setMessages((prevMessages) => [...prevMessages, messageData]);
            }
            setMessageInput("");
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

    // 메시지 삭제 핸들러
    const deleteMessage = async (deleteMessage) => {
        try {
            await deleteMessageAPI(deleteMessage);
            setMessages((prevMessages) =>
                prevMessages.filter (
                    (message) => message.timestamp !== deleteMessage.timestamp
                )
            );
        } catch (error) {
            console.error ("메시지 삭제 중 오류 : " + error.message);
        }
    }

    const handleMessageInput = (e) => { setMessageInput(e.target.value); };

    return (
        <div className="chat-messages">
            <MessageList
                messages={messages}
                onEditMessage = {handleEditMessage}
                onDeleteMessage = {deleteMessage}
                username={username}
                userId={userId}
            />
            <ChatInput
                message={messageInput}
                onMessageChange={handleMessageInput}
                handleSend={sendMessage}
                editMessage = {editingMessage?.timestamp}
                onSaveMessage={onSaveMessage}
            />
        </div>
    );
}
export default ChatMessages;