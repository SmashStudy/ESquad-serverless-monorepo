import axios from "axios";
import {getChatApi} from "../../../utils/apiConfig.js";

const apiUrl = getChatApi();
const token = localStorage.getItem("jwtToken");

const apiClient = axios.create({
    baseURL: apiUrl,
    headers: { Authorization: `Bearer ${token}` }
});

// 팀 목록 가져오기
export const fetchTeamListAPI = async () => {
    try{
        const response = await apiClient.get(`/team`);
        return response.data;
    } catch (error) {
      console.error("팀 목록 가져오기 실패: " , error.message);
      throw error;
    }
}

// 메시지 조회
export const fetchMessageAPI = async (room_id) => {
    try {
        const response = await apiClient.get(`/read`, {
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

        console.log(`messageData: ${JSON.stringify(messageData)}`);

        socket.current.send(JSON.stringify(messageData));
        // 파일 메시지 처리
        if (messageData.fileKey) {
            // 파일 메타데이터 확인
            if (!messageData.contentType || !messageData.fileKey) {
                console.error("파일 메타데이터 누락:", messageData);
                return;
            }

            try {
                // HTTP 요청으로 파일 메타데이터 저장
                await apiClient.put("/send", {
                    room_id: String(messageData.room_id),
                    message: messageData.message,
                    timestamp: messageData.timestamp,
                    user_id: messageData.user_id,
                    nickname: messageData.nickname,
                    fileKey: messageData.fileKey,
                    contentType: messageData.contentType,
                    originalFileName: messageData.originalFileName,
                });
            } catch (putError) {
                console.error("파일 메타데이터 저장 실패:", putError.message);
                throw putError;
            }
        }
    } catch (error) {
        console.error("메시지 전송 실패 : ", error.message);
        throw error;
    }
};

// 메시지 수정
export const editMessageAPI = async (editingMessage, newMessageContent) => {
    const {room_id, content, timestamp} = editingMessage;
    try {
        await apiClient.put("/update", {
            room_id: String(room_id),
            message: content,
            newMessage: newMessageContent,
            timestamp: Number(timestamp),
        });
    }catch (error) {
        console.error("메시지 수정 실패 : ", error.message);
        throw error;
    }
};

// 메시지 삭제
export const deleteMessageAPI = async (deleteMessage) => {
    try {
        await apiClient.delete(`/delete`, {
            data: {
                room_id: String(deleteMessage.room_id),
                timestamp: deleteMessage.timestamp,
                message: deleteMessage.message,
                fileKey: deleteMessage.fileKey || null
            }
        });
    } catch (error) {
        console.error("메시지 삭제 실패 : " , error.response?.data || error.message);
    }
};
