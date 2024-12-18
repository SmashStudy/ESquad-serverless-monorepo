import axios from 'axios';
import {getStorageApi} from "../../../utils/apiConfig.js";
import {getMimeType} from "../../../utils/storage/getMimeType.js";
import {getFormattedDate} from "../../../utils/fileFormatUtils.js";

const storageApi = getStorageApi();
const token = localStorage.getItem("jwtToken");

export const fetchFiles = async (room_id) => {
    try {
        const response = await axios.get(`${storageApi}/metadata`, {
            params: {
                targetId: room_id,
                targetType: 'CHAT',
            },
            headers: { Authorization: `Bearer ${token}` }
        });

        const fileMessages = (response.data.items || []).map((file) => ({
            action: 'fileMessage',
            message: `파일 업로드 완료: ${file.originalFileName}`,
            fileKey: file.fileKey,
            room_id,
            user_id: file.userEmail,
            nickname: file.userNickname,
            timestamp: file.createdAt || Date.now(),
            contentType: file.contentType,
            originalFileName: file.originalFileName,
        }));
        return fileMessages;
    } catch (error) {
        console.error("파일 데이터를 불러오는 중 오류 발생:", error);
        return []; // 빈 배열 반환
    }
};

export const uploadFile = async ({ file, room_id, user_id, nickname, targetType}) => {

    try {
        const presignedResponse = await axios.post(
            `${storageApi}/upload-file`,
            {
                originalFileName: file.name,
                targetId: room_id,
                targetType: targetType,
                userEmail: user_id,
                userNickname: nickname,
                fileSize: file.size,
                contentType: file ? file.type : getMimeType(
                    file.name),
                actualType: file.type,
                createdAt: getFormattedDate(),
            },
            { headers: {'Content-Type': 'application/json'}}
        );

        const {presignedUrl, fileKey} = presignedResponse.data;
        await axios.put(presignedUrl, file, {
            headers: { 'Content-Type': file.type} ,
        });

        return {
            fileKey: fileKey,
            originalFileName: file.name,
            contentType: file.type,
            fileSize: file.size
        };
    } catch (error) {
        console.error('파일 업로드 실패:', error.message);
        throw error;
    }
};

export const deleteFile = async (fileKey) => {
    try {
        const presignedResponse = await axios.delete(
            `${storageApi}/${encodeURIComponent(fileKey)}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
                }
            });
        await axios.delete(presignedResponse.data.presignedUrl);
    } catch (error) {
        console.error('파일 삭제 실패:', error.message);
    }
};