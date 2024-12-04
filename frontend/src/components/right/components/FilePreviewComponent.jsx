import React, { useEffect, useState } from "react";
import { getPresignedUrl } from "../chatApi/ChatUtils.jsx";
import {fetchPreview} from "../../../utils/storage/utilities.js";

const FilePreviewComponent = ({ fileKey, contentType }) => {
    const [previewUrl, setPreviewUrl] = useState(null);

    useEffect(() => {
        const fetchPreviewUrl = async () => {
            if (fileKey) {
                try {
                    await fetchPreview(fileKey, setPreviewUrl);
                } catch (error) {
                    console.error("미리보기 URL 요청 실패:", error);
                }
            }
        };
        fetchPreviewUrl();
    }, [fileKey]);

    // 파일 미리보기가 이미지인 경우
    if (contentType?.startsWith("image/")) {
        return (
            <img
                src={previewUrl}
                alt="미리보기"
                style={{
                    maxWidth: "100px",
                    maxHeight: "100px",
                    objectFit: "cover",
                    borderRadius: "4px",
                }}
            />
        );
    }
    return <p>미리보기를 지원하지 않는 파일 형식입니다.</p>;
};

export default FilePreviewComponent;
