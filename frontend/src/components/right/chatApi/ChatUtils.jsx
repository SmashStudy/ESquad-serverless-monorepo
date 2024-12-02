import axios from "axios";
import {getStorageApi} from "../../../utils/apiConfig.js";

export const getPresignedUrl = async (fileKey ,originalFileName) => {
    try {
        const storageApi = getStorageApi();
        const response = await axios.post(
            `${storageApi}/presigned-url`,
            { action: "getObject", fileKey: fileKey },
            { headers: { "Content-Type": "application/json" } }
        );
        return response.data.presignedUrl;
    } catch (error) {
        console.error("Presigned URL 요청 실패:", error.message);
        throw error;
    }
};