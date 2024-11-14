import axios from "axios";

const apiUrl = "https://nfrsy8mlm4.execute-api.us-east-1.amazonaws.com";

const apiClient = axios.create({
    baseURL: apiUrl,
    headers: {
        "Content-Type": "application/json"
    }
});

// 메시지 조회
export const fetchMessageAPI = async (room_id) => {
    try {
        const response = await apiClient.get(`/chat/read`, {
            params: {room_id}
        });
        return response.data;
    } catch (error) {
        console.log("메시지 불러오기 실패 : ", error.message);
        throw error;
    }
};

// 메시지 전송
export const sendMessageAPI = async (socket, messageData) => {
    try {
        socket.send(JSON.stringify(messageData));
        console.log("메시지 전송 : " , messageData);
    } catch (error) {
        console.error("메시지 전송 실패 : ", error.message);
        throw error;
    }
};

// 메시지 수정
export const editMessageAPI = async (editingMessage, newMessageContent) => {
    const {room_id, content, timestamp} = editingMessage;
    try {
        await apiClient.put("/chat/update", {
            room_id: room_id,
            message: content,
            newMessage: newMessageContent,
            timestamp: Number(timestamp),
        });
        console.log("메시지 수정 성공");
    }catch (error) {
        console.error("메시지 수정 실패 : ", error.message);
        throw error;
    }
};

// 메시지 삭제
export const deleteMessageAPI = async (deleteMessage) => {
    try {
        await apiClient.delete(`/chat/delete`, {
            data: {
                room_id: deleteMessage.room_id,
                timestamp: Number(deleteMessage.timestamp),
                message: deleteMessage.message
            }
        })
        console.log("메시지 삭제 성공");
    } catch (error) {
        console.error("메시지 삭제 실패 : " , error.response?.data || error.message);
    }
};
