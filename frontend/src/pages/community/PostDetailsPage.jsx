import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
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
  Chip,
  Typography,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import { getCommunityApi, getUserApi } from "../../utils/apiConfig";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import PostEditDialog from "../../components/content/community/PostEditDialog";
import logoImage from "../../assets/esquad-logo-nbk.png";
import Tooltip from "@mui/material/Tooltip";

const PostDetailsPage = () => {
  const { boardType, postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [commentContent, setCommentContent] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [commentAlertOpen, setCommentAlertOpen] = useState(false);
  const [deleteCommentAlertOpen, setDeleteCommentAlertOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [likedByUser, setLikedByUser] = useState(false);

  const menuOpen = Boolean(menuAnchorEl);
  const fetchRef = useRef(false); // 중복 호출 방지 플래그

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

        const userEmail = response.data?.email;
        setCurrentUser({ ...response.data, email: userEmail });
      } catch (error) {
        console.error("유저 정보를 불러오는 중 오류 발생:", error);
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    const fetchPostAndIncrementView = async () => {
      if (fetchRef.current) return;
      fetchRef.current = true;

      setLoading(true);

      try {
        setLoading(true); // 로딩 시작
        const response = await axios.get(
          `${getCommunityApi()}/${boardType}/${postId}`,
          { params: { createdAt } }
        );

        if (response.status === 200) {
          const postData = response.data;
          setPost(postData);
          setLikedByUser(
            postData.likedUsers?.includes(currentUser?.email) || false
          );
        }
      } catch (error) {
        console.error("데이터를 불러오는 중 오류 발생:", error);
      } finally {
        setLoading(false);
      }
    };

    if (boardType && postId && createdAt) {
      fetchPostAndIncrementView();
    }
  }, [boardType, postId, createdAt, currentUser]);

  // 댓글 가져오기
  useEffect(() => {
    const fetchComments = async () => {
      try {
        if (!post) return;

        const response = await axios.get(
          `${getCommunityApi()}/${boardType}/${postId}/comments`,
          { params: { createdAt } }
        );

        if (response.data?.comments) {
          setComments(response.data.comments);
        }
      } catch (error) {
        console.error("댓글 데이터를 불러오는 중 오류 발생:", error);
      }
    };

    fetchComments();
  }, [boardType, postId, createdAt, post]);

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
    setIsEditDialogOpen(true);
    handleMenuClose();
  };

  const handleUpdatePost = (updatedPost) => {
    // 게시글 수정 후 상태 업데이트
    setPost((prevPost) => ({
      ...prevPost,
      ...updatedPost,
      updatedAt: new Date().toISOString(), // updatedAt 필드를 현재 시간으로 업데이트
    }));
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

  const handleLikePost = async () => {
    try {
      const token = localStorage.getItem("jwtToken");

      if (!token || !currentUser?.email) {
        throw new Error("로그인이 필요합니다.");
      }

      const response = await axios.post(
        `${getCommunityApi()}/${boardType}/${postId}/like`,
        { userEmail: currentUser.email },
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { createdAt },
        }
      );

      if (response.status === 200) {
        setPost((prevPost) => ({
          ...prevPost,
          likeCount: response.data.updatedAttributes.likeCount,
        }));
        setLikedByUser(!likedByUser);
      }
    } catch (error) {
      console.error("좋아요 처리 중 오류 발생:", error.message);
      alert("좋아요 처리에 실패했습니다.");
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

  if (!loading && (!post || post === null)) {
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

      {/* 태그 표시 */}
      <Box sx={{ mt: 1, mb: 2 }}>
        {post.tags && post.tags.length > 0 && (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {post.tags.map((tag, index) => (
              <Chip
                key={`tag-${index}`}
                label={tag}
                variant="outlined"
                color="primary"
                size="small"
              />
            ))}
          </Box>
        )}
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          color: "text.secondary",
        }}
      >
        <Box>
          <Typography variant="body2">
            {new Date(post.createdAt).toLocaleString()} • 👁 {post.viewCount}
            {post.updatedAt &&
              new Date(post.updatedAt).getTime() !==
                new Date(post.createdAt).getTime() && (
                <Tooltip
                  title={`${new Date(post.updatedAt).toLocaleString()} 수정`}
                >
                  <Typography
                    component="span"
                    variant="body2"
                    sx={{
                      textDecoration: "underline",
                      cursor: "pointer",
                      ml: 1,
                    }}
                  >
                    수정됨
                  </Typography>
                </Tooltip>
              )}
          </Typography>
        </Box>
        <Typography variant="body2">
          작성자:{" "}
          <Typography component="span" variant="body2" sx={{ color: "black" }}>
            {post.writer?.nickname || "알 수 없음"}
          </Typography>
        </Typography>
      </Box>

      <Button
        startIcon={<ThumbUpIcon />}
        onClick={handleLikePost}
        sx={{
          color: likedByUser ? "primary.main" : "text.secondary",
        }}
      >
        {post.likeCount}
      </Button>
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
        답변{" "}
        <Box component="span" sx={{ color: "primary.main" }}>
          {comments.length}
        </Box>
      </Typography>
      {comments.length === 0 ? (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            mt: 4,
          }}
        >
          <img
            src={logoImage}
            alt="답변 대기 이미지"
            style={{ width: "100px", height: "100px", marginBottom: "20px" }}
          />
          <Typography variant="body1" sx={{ color: "text.primary", mb: 1 }}>
            답변을 기다리고 있는 질문이에요
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", mb: 4 }}>
            첫번째 답변을 남겨보세요!
          </Typography>
        </Box>
      ) : (
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
                  {comment.updatedAt &&
                    new Date(comment.updatedAt).getTime() !==
                      new Date(comment.createdAt).getTime() &&
                    ` (수정됨: ${new Date(
                      comment.updatedAt
                    ).toLocaleString()})`}
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
      )}

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          value={commentContent}
          onChange={(e) => setCommentContent(e.target.value)}
          placeholder={`${
            currentUser?.nickname || "알수없는 사용자"
          }님, 답변을 작성해보세요.`}
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
      <PostEditDialog
        open={isEditDialogOpen}
        handleClose={() => setIsEditDialogOpen(false)}
        postDetails={post}
        onUpdate={(updatedPost) => {
          updatedPost.updatedAt = new Date().toISOString();
          handleUpdatePost(updatedPost);
        }}
      />
    </Box>
  );
};
export default PostDetailsPage;
