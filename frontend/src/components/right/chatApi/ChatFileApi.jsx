import axios from 'axios';

const storageApi = 'https://api.esquad.click/test/files';

export const fetchFiles = async (room_id) => {
    try {
        const response = await axios.get(`${storageApi}/metadata`, {
            params: {
                targetId: room_id,
                targetType: 'CHAT',
            },
        });

        const fileMessages = (response.data.items || []).map((file) => ({
            action: 'fileMessage',
            message: `파일 업로드 완료: ${file.originalFileName}`,
            fileKey: file.fileKey,
            presignedUrl: file.presignedUrl,
            room_id,
            user_id: file.user_id,
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

export const uploadFile = async ({ file, room_id, user_id}) => {
    const uniqueFileName = `${Date.now()}-${file.name}`;
    const timestamp = new Date().toISOString();

    try {
        const presignedResponse = await axios.post(
            `${storageApi}/presigned-url`,
            {
                action: 'putObject',
                fileKey: `files/${uniqueFileName}`,
                contentType: file.type,
            },
            { headers: { 'Content-Type': 'application/json' } }
        );
        await axios.put(presignedResponse.data.presignedUrl, file, {
            headers: { 'Content-Type': file.type },
        });
        const metadataResponse = await axios.post(
            `${storageApi}/store-metadata`,
            {
                fileKey: `files/${uniqueFileName}`,
                metadata: {
                    targetId: room_id,
                    targetType: 'CHAT',
                    user_id,
                    fileSize: file.size,
                    extension: file.type.split('/').pop(),
                    contentType: file.type,
                    originalFileName: file.name,
                    storedFileName: uniqueFileName,
                    createdAt: timestamp,
                },
            },
            {headers: {'Content-Type': 'application/json'}}
        );
        const { fileKey, originalFileName, storedFileName, contentType, fileSize } = metadataResponse.data.data;

        return {
            fileKey: fileKey,
            originalFileName,
            storedFileName,
            contentType,
            fileSize,
            presignedUrl: presignedResponse.data.presignedUrl,
        };
    } catch (error) {
        console.error('파일 업로드 실패:', error.message);
        throw error;
    }
};

export const deleteFile = async (fileKey) => {
    try {
        const presignedResponse = await axios.post(
            `${storageApi}/presigned-url`,
            { action: 'deleteObject', fileKey: fileKey },
            { headers: { 'Content-Type': 'application/json' } }
        );

        await axios.delete(presignedResponse.data.presignedUrl);
        await axios.delete(`${storageApi}/${encodeURIComponent(fileKey)}`);
        console.log('파일 삭제 성공:');
    } catch (error) {
        console.error('파일 삭제 실패:', error.message);
    }
};

export const downloadFile = async (fileKey, originalFileName) => {
    try {
        const presignedResponse = await axios.post(
            `${storageApi}/presigned-url`,
        { action: 'getObject', fileKey: fileKey },
        { headers: { 'Content-Type': 'application/json' } }
    );

        const downloadResponse = await axios.get(
            presignedResponse.data.presignedUrl,
            { responseType: 'blob' }
        );

        const blob = new Blob([downloadResponse.data], {
            type: downloadResponse.headers['content-type'],
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = originalFileName || fileKey;
        document.body.appendChild(link);
        link.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(link);
    } catch (error) {
        console.error('파일 다운로드 실패:', error.message);
        throw error;
    }
};