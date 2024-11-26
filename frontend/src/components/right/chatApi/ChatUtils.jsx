import axios from "axios";

export const getPresignedUrl = async (fileKey ,originalFileName) => {
    try {
        const storageApi = 'https://api.esquad.click/test/files';
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