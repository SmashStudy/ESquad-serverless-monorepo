import React, { useEffect, useState } from "react";
import axios from "axios";

const FilePreviewComponent = ({ fileKey, contentType}) => {
    const [presignedUrl, setPresignedUrl] = useState(null);
    const [error, setError] = useState(null);

    const getPresignedUrl = async (fileKey, storedFileName ) => {
        try {
            const lambdaUrl = "https://api.esquad.click/dev/files";
            const response = await axios.post(
                `${lambdaUrl}/presigned-url`,
            { action: "getObject", fileKey },
            { headers: { "Content-Type": "application/json" } }
        );
            return response.data.presignedUrl;
        } catch (error) {
            console.error("Presigned URL 요청 실패:", error.message);
            throw new Error("Presigned URL 생성 실패");
        }
    };

    useEffect(() => {
        const fetchPresignedUrl = async () => {
            if (!fileKey) {
                setError("파일 키가 없습니다.");
                return;
            }
            try {
                const url = await getPresignedUrl(fileKey);
                setPresignedUrl(url);
            } catch (err) {
                setError("Presigned URL 가져오기 실패");
            }
        };

        fetchPresignedUrl();
    }, [fileKey]); // fileKey가 변경될 때마다 호출

    if (!presignedUrl) {
        return <p>미리보기를 로드 중입니다...</p>;
    }

    const isImageFile = (contentType?.startsWith("image/"));

    return (
        <div>
            {isImageFile ? (
                <img
                    src={presignedUrl}
                    alt="미리보기"
                    onError={(e) => console.error("이미지 로드 실패:", e)}
                    style={{
                        maxWidth: "200px",
                        maxHeight: "200px",
                        objectFit: "cover",
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                    }}
                />
            ) : (
                <p>미리보기가 지원되지 않는 파일 형식입니다.</p>
            )}
        </div>
    );
};

export default FilePreviewComponent;