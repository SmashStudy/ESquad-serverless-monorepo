import axios from "axios";
import {getStorageApi} from "../../../utils/apiConfig.js";

const token = localStorage.getItem("jwtToken");
export const getPresignedUrl = async (fileKey) => {
    try {
        const storageApi = getStorageApi();
        let response = await axios.post(
            `${storageApi}/presigned-url`,
            { action: "getObject", fileKey: fileKey },
            { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
        );
         response = await axios.get( `${storageApi}/${encodeURIComponent(fileKey)}`);
        return response.data.presignedUrl;
    } catch (error) {
        console.error("Presigned URL 요청 실패:", error.message);
        throw error;
    }
};