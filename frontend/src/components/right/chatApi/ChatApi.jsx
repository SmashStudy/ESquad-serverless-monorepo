import axios from "axios";

const apiUrl = "https://api.esquad.click/chat";

const apiClient = axios.create({
    baseURL: apiUrl,
    headers: {
        "Content-Type": "application/json"
    }
});

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
        // WebSocket 메시지 전송
        socket.send(JSON.stringify(messageData));
        console.log("메시지 전송 : ", messageData);

        // 파일 메시지 처리
        if (messageData.fileKey) {
            console.log("파일 메시지 전송 준비:", messageData);

            // 파일 메타데이터 확인
            if (!messageData.presignedUrl || !messageData.contentType || !messageData.fileKey) {
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
                    fileKey: messageData.fileKey,
                    presignedUrl: messageData.presignedUrl,
                    contentType: messageData.contentType,
                    originalFileName: messageData.originalFileName,
                });
                console.log("파일 메시지 저장됨:", messageData);
            } catch (putError) {
                console.error("파일 메타데이터 저장 실패:", putError.message);
                throw putError;
            }
        }
    } catch (error) {
        console.error("메시지 전송 실패:", error.message);
        console.error("전체 에러 객체:", error); // 전체 에러 로그
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
                timestamp: Number(deleteMessage.timestamp),
                message: deleteMessage.message,
                fileKey: deleteMessage.fileKey || null
            }
        })
        console.log("텍스트 메시지 삭제 성공");
    } catch (error) {
        if (error.response?.status === 404) {
            // 404 오류일 경우 메시지가 이미 삭제된 상태일 가능성이 있으므로 무시
            console.warn("메시지가 이미 삭제된 상태입니다.");
        } else {
            // 그 외의 오류는 로깅
            console.error("메시지 삭제 실패:", error.message);
        }
    }
};
