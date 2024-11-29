import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Chip,
  Autocomplete,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { getCommunityApi } from "../../utils/apiConfig";

const PostEditPage = () => {
  const { boardType, postId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${getCommunityApi()}/${boardType}/${postId}`
        );
        const { title, content, tags } = response.data;

        setTitle(title || "");
        setContent(content || "");
        setTags(tags || []);
      } catch (err) {
        setError("게시글 정보를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [boardType, postId]);

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

      const updatedPost = {
        title,
        content,
        tags, // 빈 배열인 경우에도 포함
      };

      await axios.put(
        `${getCommunityApi()}/${boardType}/${postId}`,
        updatedPost,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      alert("게시글이 수정되었습니다.");
      navigate(`/community/${boardType}/${postId}`);
    } catch (error) {
      console.error("게시글 수정 중 오류 발생:", error);
      alert("게시글 수정에 실패했습니다.");
    }
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: 3,
      }}
    >
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        게시글 수정
      </Typography>
      <TextField
        label="제목"
        variant="outlined"
        fullWidth
        margin="normal"
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
                key={`tag-${index}`}
                variant="outlined"
                size="small"
                label={option}
                {...restProps}
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
        margin="normal"
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <Box sx={{ mt: 3, display: "flex", justifyContent: "flex-end", gap: 2 }}>
        <Button variant="outlined" color="inherit" onClick={() => navigate(-1)}>
          취소
        </Button>
        <Button variant="contained" color="primary" onClick={handleSaveChanges}>
          저장
        </Button>
      </Box>
    </Box>
  );
};

export default PostEditPage;
