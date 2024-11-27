import React, { useState } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import { Box, Button } from "@mui/material";

const CommentSection = ({ onAddComment, writer = "사용자" }) => {
  const [isEditorActive, setIsEditorActive] = useState(false);
  const [editorContent, setEditorContent] = useState("");

  const handleCancel = () => {
    setIsEditorActive(false);
    setEditorContent("");
  };

  const handleAddComment = () => {
    if (editorContent.trim()) {
      onAddComment(editorContent);
      setEditorContent("");
      setIsEditorActive(false);
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
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
          {writer}님, 댓글을 작성해보세요.
        </Box>
      ) : (
        <Box>
          <ReactQuill
            value={editorContent}
            onChange={setEditorContent}
            style={{
              height: "200px",
              marginBottom: "32px",
              backgroundColor: "#fff",
            }}
            modules={{
              toolbar: [
                ["bold", "italic", "underline"], // 글꼴 스타일
                [{ list: "ordered" }, { list: "bullet" }], // 목록
                ["link"], // 링크
              ],
            }}
            formats={["bold", "italic", "underline", "list", "bullet", "link"]}
          />
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
              onClick={handleCancel}
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
              onClick={handleAddComment}
              variant="contained"
              color="primary"
              sx={{
                minWidth: "80px",
                padding: "8px 16px",
              }}
              disabled={!editorContent.trim()}
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
