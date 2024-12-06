import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Autocomplete,
} from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";
import { getCommunityApi } from "../../../utils/apiConfig";
import QuillEditor from "../../../utils/QuillEditor";

const PostEditDialog = ({ open, handleClose, postDetails, onUpdate }) => {
  const { boardType, postId } = useParams();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);

  useEffect(() => {
    if (postDetails) {
      setTitle(postDetails.title || "");
      setContent(postDetails.content || "");
      setTags(postDetails.tags || []);
    }
  }, [postDetails]);

  const handleTagChange = (event, newValue, reason) => {
    const uniqueTags = Array.from(new Set(newValue));
    if (uniqueTags.length > 10) {
      alert("태그는 최대 10개까지 추가할 수 있습니다.");
      return;
    }
    setTags(uniqueTags);
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("jwtToken");

      if (!postDetails?.createdAt) {
        alert("createdAt 정보가 누락되었습니다.");
        return;
      }

      const updatedPost = {
        title,
        content,
        tags: tags.length > 0 ? tags : [],
      };

      await axios.put(
        `${getCommunityApi()}/${boardType}/${postId}`,
        updatedPost,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: {
            createdAt: postDetails.createdAt,
          },
        }
      );

      alert("게시글이 수정되었습니다.");
      if (onUpdate) onUpdate(updatedPost);
      handleClose();
    } catch (error) {
      console.error("게시글 수정 중 오류 발생:", error);
      alert("게시글 수정에 실패했습니다.");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">게시글 수정</Typography>
        </Box>
      </DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1">제목</Typography>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            padding: "10px",
            marginBottom: "20px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
        <Typography variant="subtitle1" sx={{ marginTop: 2 }}>
          태그를 설정하세요 (최대 10개)
        </Typography>
        <Autocomplete
          multiple
          freeSolo
          options={[]}
          value={tags}
          onChange={(event, newValue, reason) =>
            handleTagChange(event, newValue, reason)
          }
          renderTags={(value, getTagProps) =>
            value.map((option, index) => (
              <Chip
                key={`tag-${index}`}
                variant="outlined"
                size="small"
                label={option}
                {...getTagProps({ index })}
              />
            ))
          }
          renderInput={(params) => (
            <input
              {...params}
              placeholder="태그를 입력하세요"
              style={{
                width: "100%",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          )}
        />
        <Typography variant="subtitle1" sx={{ marginTop: 2, marginBottom: 1 }}>
          내용
        </Typography>
        <QuillEditor
          value={content}
          onChange={setContent}
          placeholder="내용을 입력하세요."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          취소
        </Button>
        <Button onClick={handleSaveChanges} color="primary" variant="contained">
          저장
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PostEditDialog;
