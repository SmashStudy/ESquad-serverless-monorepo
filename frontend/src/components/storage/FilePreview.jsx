import React, {useState, useEffect} from "react";
import {fetchPreview} from "../../utils/storage/utilities.js";
import {CircularProgress} from "@mui/material";

const FilePreview = ({fileKey}) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가

  useEffect(() => {
    const fetchPreviewUrl = async () => {
      if (fileKey) {
        try {
          setIsLoading(true); // 로딩 시작
          await fetchPreview(fileKey, setPreviewUrl);
        } catch (error) {
          console.error("미리보기 URL 요청 실패:", error);
        } finally {
          setIsLoading(false); // 로딩 종료
        }
      }
    };
    fetchPreviewUrl();
  }, [fileKey]);

  return (
      <div
          style={{
            width: "300px",
            height: "300px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "8px", // 모서리 둥글게
            overflow: "hidden",
          }}
      >
        {isLoading ? (
            <CircularProgress/> // 로딩 중 표시
        ) : (
            <img
                src={previewUrl}
                alt="미리보기"
                style={{
                  width: "300px",
                  height: "300px",
                  objectFit: "contain", // 이미지 비율 유지
                }}
            />
        )
        }
      </div>
  );
};

export default FilePreview;
