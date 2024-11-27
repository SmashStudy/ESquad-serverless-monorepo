import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Box, Button, Typography } from "@mui/material";

const CommentSection = ({ onAddComment, writer = "사용자" }) => {
  const [isEditorActive, setIsEditorActive] = useState(false); // 에디터 활성화 상태
  const [editorContent, setEditorContent] = useState(""); // 에디터 내용

  // 댓글 작성 취소 핸들러
  const handleCancel = () => {
    setIsEditorActive(false);
    setEditorContent(""); // 에디터 초기화
  };

  // 댓글 등록 핸들러
  const handleAddComment = () => {
    if (editorContent.trim()) {
      onAddComment(editorContent); // 상위 컴포넌트로 에디터 내용을 전달
      setEditorContent(""); // 에디터 초기화
      setIsEditorActive(false); // 에디터 비활성화
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {/* 에디터 비활성화 상태 */}
      {!isEditorActive ? (
        <Box
          onClick={() => setIsEditorActive(true)}
          sx={{
            padding: 2,
            border: "1px solid #ccc",
            borderRadius: "4px",
            cursor: "pointer",
            "&:hover": { borderColor: "#aaa" },
          }}
        >
          <Typography variant="body1" sx={{ color: "#777" }}>
            {writer}님, 댓글을 작성해보세요.
          </Typography>
        </Box>
      ) : (
        // 에디터 활성화 상태
        <Box>
          <ReactQuill
            value={editorContent} // 에디터의 값
            onChange={setEditorContent} // 에디터의 값 변경 핸들러
            style={{
              height: "200px",
              marginBottom: "32px",
              backgroundColor: "#fff",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
            modules={{
              toolbar: [
                ["bold", "italic", "underline"], // 텍스트 스타일
                [{ list: "ordered" }, { list: "bullet" }], // 리스트
                ["link"], // 링크
              ],
            }}
            formats={["bold", "italic", "underline", "list", "bullet", "link"]}
          />
          {/* 등록 및 취소 버튼 */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 2,
              marginTop: "16px",
              paddingTop: "24px",
              borderTop: "1px solid #eee",
            }}
          >
            <Button
              onClick={handleCancel} // 작성 취소
              variant="outlined"
              color="error"
              sx={{
                minWidth: "80px",
                padding: "8px 16px",
              }}
            >
              취소
            </Button>
            <Button
              onClick={handleAddComment} // 댓글 등록
              variant="contained"
              color="primary"
              sx={{
                minWidth: "80px",
                padding: "8px 16px",
              }}
              disabled={!editorContent.trim()} // 내용이 비어 있으면 비활성화
            >
              등록
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default CommentSection;
