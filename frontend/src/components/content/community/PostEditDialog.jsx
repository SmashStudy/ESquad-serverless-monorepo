import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  Chip,
  Autocomplete,
} from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";
import { getCommunityApi } from "../../../utils/apiConfig";

const PostEditDialog = ({ open, handleClose, postDetails }) => {
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

  // 태그 관련 함수
  const handleTagKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();

      const newTag = event.target.value.trim();
      if (!newTag) return;

      if (tags.includes(newTag)) {
        alert(`중복된 태그: "${newTag}"는 추가할 수 없습니다.`);
        return;
      }

      if (tags.length >= 10) {
        alert("태그는 최대 10개까지 추가할 수 있습니다.");
        return;
      }

      setTags((prevTags) => [...prevTags, newTag]);
      event.target.value = "";
    }
  };

  const handleTagChange = (event, newValue, reason) => {
    if (reason === "clear") {
      setTags([]);
    } else if (
      reason === "removeOption" ||
      reason === "createOption" ||
      reason === "selectOption"
    ) {
      const uniqueTags = Array.from(new Set(newValue));
      if (uniqueTags.length > 10) {
        alert("태그는 최대 10개까지 추가할 수 있습니다.");
        return;
      }
      setTags(uniqueTags);
    }
  };

  const handleSaveChanges = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      if (!token) {
        alert("로그인이 필요합니다.");
        return;
      }

      if (!postDetails?.createdAt) {
        alert("createdAt 정보가 누락되었습니다.");
        return;
      }

      const updatedPost = {
        title,
        content,
        tags,
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
            createdAt: postDetails.createdAt, // createdAt을 쿼리 파라미터로 전달
          },
        }
      );

      alert("게시글이 수정되었습니다.");
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
        <TextField
          label="제목"
          variant="outlined"
          fullWidth
          margin="dense"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
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
            value.map((option, index) => {
              const { key, ...restProps } = getTagProps({ index });
              return (
                <Chip
                  key={`tag-${index}`} // 명시적으로 key 설정
                  variant="outlined"
                  size="small"
                  label={option}
                  {...restProps} // 나머지 props 전달
                />
              );
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              variant="standard"
              placeholder="입력 후 엔터키를 누르면 태그가 생성됩니다."
              onKeyDown={handleTagKeyDown}
              sx={{ width: "100%", p: 1 }}
            />
          )}
        />
        <TextField
          label="내용"
          variant="outlined"
          fullWidth
          multiline
          rows={10}
          margin="dense"
          value={content}
          onChange={(e) => setContent(e.target.value)}
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
