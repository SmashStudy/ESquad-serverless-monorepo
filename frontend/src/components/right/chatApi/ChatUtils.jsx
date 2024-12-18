import axios from "axios";
import {getStorageApi} from "../../../utils/apiConfig.js";

export const getPresignedUrl = async (fileKey) => {
    try {
        const storageApi = getStorageApi();
        const response = await axios.get( `${storageApi}/${encodeURIComponent(fileKey)}`);
        return response.data.presignedUrl;
    } catch (error) {
        console.error("Presigned URL 요청 실패:", error.message);
        throw error;
    }
};