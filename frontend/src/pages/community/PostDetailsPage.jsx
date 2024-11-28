import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Typography,
  CircularProgress,
  Divider,
  Paper,
  Button,
  TextField,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { getCommunityApi, getUserApi } from "../../utils/apiConfig";

const PostDetailsPage = () => {
  const { boardType, postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [commentContent, setCommentContent] = useState(""); // 댓글 내용
  const menuOpen = Boolean(menuAnchorEl);

  const createdAt = new URLSearchParams(window.location.search).get(
    "createdAt"
  );

  // 유저 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        if (!token) throw new Error("로그인이 필요합니다.");

        const response = await axios.get(`${getUserApi()}/get-user-info`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUser(response.data);
      } catch (error) {
        console.error("유저 정보를 불러오는 중 오류 발생:", error);
      }
    };

    fetchUserInfo();
  }, []);

  // 게시글 가져오기
  // 게시글 및 댓글 가져오기
  useEffect(() => {
    const fetchPostAndComments = async () => {
      try {
        setLoading(true);
        if (!createdAt) {
          console.error("createdAt 값이 누락되었습니다.");
          navigate(`/community/${boardType}`, { replace: true });
          return;
        }

        // 게시글 가져오기
        const postResponse = await axios.get(
          `${getCommunityApi()}/${boardType}/${postId}`,
          {
            params: { createdAt },
          }
        );

        if (postResponse.data) {
          setPost(postResponse.data);
        } else {
          setPost(null);
        }

        // 댓글 가져오기
        const commentsResponse = await axios.get(
          `${getCommunityApi()}/${boardType}/${postId}/comments`,
          {
            params: { createdAt },
          }
        );

        if (commentsResponse.data && commentsResponse.data.comments) {
          setComments(commentsResponse.data.comments);
        }
      } catch (error) {
        console.error("데이터를 불러오는 중 오류 발생:", error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPostAndComments();
  }, [boardType, postId, createdAt, navigate]);

  const handleMenuClick = (event) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleEdit = () => {
    navigate(`/community/${boardType}/${postId}/edit`);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      await axios.delete(`${getCommunityApi()}/${boardType}/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { createdAt },
      });
      alert("게시글이 삭제되었습니다.");
      navigate(`/community/${boardType}`);
    } catch (error) {
      console.error("게시글 삭제 중 오류 발생:", error);
      alert("게시글 삭제에 실패했습니다.");
    }
  };

  const handleAddComment = async () => {
    if (!commentContent.trim()) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      const token = localStorage.getItem("jwtToken");

      const newComment = {
        content: commentContent,
        writer: {
          name: currentUser.name,
          nickname: currentUser.nickname,
          email: currentUser.email,
        },
      };

      const response = await axios.post(
        `${getCommunityApi()}/${boardType}/${postId}`,
        newComment,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          params: { createdAt },
        }
      );

      if (response.status === 200) {
        alert("댓글이 성공적으로 등록되었습니다.");
        setComments((prevComments) => [
          {
            ...newComment,
            createdAt: new Date().toISOString(),
          },
          ...prevComments,
        ]);
        setCommentContent(""); // 댓글 입력 초기화
      } else {
        alert("댓글 등록에 실패했습니다. 서버가 응답하지 않았습니다.");
      }
    } catch (error) {
      console.error("댓글 등록 중 오류 발생:", error);
      alert("댓글 등록에 실패했습니다. 서버와의 통신 중 오류가 발생했습니다.");
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

  if (!post) {
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
          게시글을 찾을 수 없습니다. 다시 시도해주세요.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        padding: 3,
        maxWidth: "1200px",
        margin: "0 auto",
        backgroundColor: "#fafafa",
        borderRadius: 2,
        boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Button
        onClick={() => navigate(`/community/${boardType}`)}
        startIcon={<ArrowBackIcon />}
        sx={{
          marginBottom: 2,
          textTransform: "none",
          color: "primary.main",
        }}
      >
        뒤로가기
      </Button>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h4" fontWeight="bold">
          {post.title}
        </Typography>
        {post.writer?.email === currentUser?.email && (
          <div>
            <IconButton onClick={handleMenuClick}>
              <MoreVertIcon />
            </IconButton>
            <Menu
              anchorEl={menuAnchorEl}
              open={menuOpen}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleEdit}>수정</MenuItem>
              <MenuItem onClick={handleDelete}>삭제</MenuItem>
            </Menu>
          </div>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          color: "text.secondary",
        }}
      >
        <Typography variant="body2">
          작성자: {post.writer?.nickname || "알 수 없음"} •{" "}
          {new Date(post.createdAt).toLocaleString()}
        </Typography>
        <Typography variant="body2">
          조회수: {post.viewCount} • 좋아요: {post.likeCount}
        </Typography>
      </Box>

      <Divider sx={{ marginBottom: 3 }} />

      <Paper
        elevation={2}
        sx={{
          padding: 3,
          marginBottom: 3,
          backgroundColor: "#fff",
          borderRadius: 2,
        }}
      >
        <Typography
          variant="body1"
          sx={{ whiteSpace: "pre-line", fontSize: "1rem", lineHeight: 1.6 }}
        >
          {post.content}
        </Typography>
      </Paper>

      <Typography variant="h6" fontWeight="bold" mb={2}>
        댓글
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          placeholder="댓글을 입력하세요."
          variant="outlined"
          fullWidth
          multiline
          rows={2}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleAddComment}
          disabled={!commentContent.trim()}
        >
          댓글 등록
        </Button>
      </Box>
      <Box
        sx={{
          mb: 2,
          flexDirection: "column",
          height: 350,
          overflow: "hidden",
          overflowY: "scroll",
        }}
      >
        {comments
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
          .map((comment, index) => (
            <Paper
              key={index}
              elevation={1}
              sx={{ padding: 2, marginBottom: 1, backgroundColor: "#f9f9f9" }}
            >
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                {comment.writer?.nickname || "익명"}
              </Typography>
              <Typography variant="body2">{comment.content}</Typography>
              <Typography
                variant="caption"
                sx={{ color: "text.secondary", display: "block", mt: 1 }}
              >
                {new Date(comment.createdAt).toLocaleString()}
              </Typography>
            </Paper>
          ))}
      </Box>
    </Box>
  );
};

export default PostDetailsPage;
