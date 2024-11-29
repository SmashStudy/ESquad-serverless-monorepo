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
  Snackbar,
  Alert,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { getCommunityApi, getUserApi } from "../../utils/apiConfig";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

const PostDetailsPage = () => {
  const { boardType, postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [commentContent, setCommentContent] = useState(""); // 댓글 내용
  const [editingCommentId, setEditingCommentId] = useState(null); // 수정 중인 댓글 ID
  const [commentAlertOpen, setCommentAlertOpen] = useState(false); // 댓글 등록 알림 스낵바
  const [deleteCommentAlertOpen, setDeleteCommentAlertOpen] = useState(false); // 댓글 삭제 알림 스낵바

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
  // 댓글 가져오기 함수
  const fetchComments = async () => {
    try {
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
      console.error("댓글 데이터를 불러오는 중 오류 발생:", error);
    }
  };

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

      if (editingCommentId) {
        // 댓글 수정
        const updatedComment = {
          content: commentContent,
          commentId: editingCommentId, // **commentId를 포함해야 합니다.**
          userEmail: currentUser.email, // 작성자의 이메일 추가
        };

        await axios.put(
          `${getCommunityApi()}/${boardType}/${postId}/comments/${editingCommentId}`,
          updatedComment,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            params: { createdAt },
          }
        );

        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment.id === editingCommentId
              ? {
                  ...comment,
                  content: commentContent,
                  updatedAt: new Date().toISOString(),
                }
              : comment
          )
        );

        setEditingCommentId(null);
      } else {
        // 댓글 추가
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
        setCommentAlertOpen(true); // 댓글 등록 알림 열기
      }

      setCommentContent(""); // 댓글 입력 초기화
      await fetchComments(); // 댓글 목록 새로고침
    } catch (error) {
      console.error("댓글 처리 중 오류 발생:", error);
      alert("댓글 등록/수정에 실패했습니다.");
    }
  };

  const handleCancelComment = () => {
    setCommentContent("");
    setEditingCommentId(null); // 수정 모드 취소
  };

  const handleEditComment = (comment) => {
    setEditingCommentId(comment.id);
    setCommentContent(comment.content);
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const token = localStorage.getItem("jwtToken");

      // 댓글 삭제 요청 시 필요한 데이터를 쿼리 매개변수로 전달
      await axios.delete(
        `${getCommunityApi()}/${boardType}/${postId}/comments/${commentId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            createdAt,
            userEmail: currentUser.email, // 쿼리 매개변수로 사용자 이메일 전달
          },
        }
      );

      setComments((prevComments) =>
        prevComments.filter((comment) => comment.id !== commentId)
      );

      setDeleteCommentAlertOpen(true); // 댓글 삭제 알림 열기
      await fetchComments(); // 댓글 목록 새로고침
    } catch (error) {
      console.error("댓글 삭제 중 오류 발생:", error);
      alert("댓글 삭제에 실패했습니다.");
    }
  };

  const handleCloseCommentAlert = () => {
    setCommentAlertOpen(false);
  };

  const handleCloseDeleteCommentAlert = () => {
    setDeleteCommentAlertOpen(false);
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
          {editingCommentId ? "수정" : "등록"}
        </Button>
        <Button
          variant="text"
          color="black"
          onClick={handleCancelComment}
          sx={{
            textTransform: "none",
            padding: "6px 16px",
          }}
        >
          취소
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

              {/* 댓글 작성자가 현재 사용자와 일치할 때 수정/삭제 버튼 표시 */}
              {comment.writer?.email === currentUser?.email && (
                <Box sx={{ mt: 1, display: "flex", gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => handleEditComment(comment)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              )}
            </Paper>
          ))}
      </Box>
      {/* 댓글 등록 알림 스낵바 */}
      <Snackbar
        open={commentAlertOpen}
        autoHideDuration={3000}
        onClose={handleCloseCommentAlert}
      >
        <Alert
          onClose={handleCloseCommentAlert}
          severity="success"
          sx={{ width: "100%" }}
        >
          댓글이 등록되었습니다!
        </Alert>
      </Snackbar>
      {/* 댓글 삭제 알림 스낵바 */}
      <Snackbar
        open={deleteCommentAlertOpen}
        autoHideDuration={3000}
        onClose={handleCloseDeleteCommentAlert}
      >
        <Alert
          onClose={handleCloseDeleteCommentAlert}
          severity="error"
          sx={{ width: "100%" }}
        >
          댓글이 삭제되었습니다!
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default PostDetailsPage;
