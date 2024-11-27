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
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CommentSection from "../../components/content/community/CommentSection";

const PostDetailsPage = () => {
  const { boardType, postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // 현재 유저 정보
  const [menuAnchorEl, setMenuAnchorEl] = useState(null); // 메뉴(anchor) 상태
  const menuOpen = Boolean(menuAnchorEl); // 메뉴 열림 여부

  const createdAt = new URLSearchParams(window.location.search).get(
    "createdAt"
  );

  // 유저 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        if (!token) throw new Error("로그인이 필요합니다.");

        const response = await axios.get(
          "https://api.esquad.click/local/users/get-user-info",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setCurrentUser(response.data); // 유저 정보 설정
      } catch (error) {
        console.error("유저 정보를 불러오는 중 오류 발생:", error);
      }
    };

    fetchUserInfo();
  }, []);

  // 게시글 가져오기
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        if (!createdAt) {
          console.error("createdAt 값이 누락되었습니다.");
          navigate(`/community/${boardType}`, { replace: true });
          return;
        }

        const response = await axios.get(
          `https://api.esquad.click/dev/community/${boardType}/${postId}`,
          {
            params: { createdAt },
          }
        );
        if (response.data) {
          setPost(response.data);
          setComments(response.data.comments || []); // 댓글 데이터 추가
        } else {
          setPost(null);
        }
      } catch (error) {
        console.error("게시글 데이터를 불러오는 중 오류 발생:", error);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [boardType, postId, createdAt, navigate]);

  const handleMenuClick = (event) => {
    setMenuAnchorEl(event.currentTarget); // 메뉴 anchor 설정
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null); // 메뉴 닫기
  };

  const handleEdit = () => {
    navigate(`/community/${boardType}/${postId}/edit`);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      await axios.delete(
        `https://api.esquad.click/dev/community/${boardType}/${postId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { createdAt },
        }
      );
      alert("게시글이 삭제되었습니다.");
      navigate(`/community/${boardType}`);
    } catch (error) {
      console.error("게시글 삭제 중 오류 발생:", error);
      alert("게시글 삭제에 실패했습니다.");
    }
  };

  const handleAddComment = async (content) => {
    try {
      const token = localStorage.getItem("jwtToken");

      // 댓글 데이터 생성
      const newComment = {
        content,
        writer: {
          name: currentUser.name,
          nickname: currentUser.nickname,
          email: currentUser.email,
        },
      };

      // API 요청
      const response = await axios.post(
        `https://api.esquad.click/dev/community/${boardType}/${postId}/comments`,
        newComment,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // Content-Type 추가
          },
          params: { createdAt }, // Query parameters
        }
      );

      if (response.status === 200) {
        alert("댓글이 성공적으로 등록되었습니다.");

        // 댓글 목록 업데이트
        setComments((prevComments) => [
          {
            ...newComment,
            createdAt: new Date().toISOString(),
          },
          ...prevComments, // 새 댓글을 상단에 추가
        ]);
      } else {
        alert("댓글 등록에 실패했습니다. 서버가 응답하지 않았습니다.");
      }
    } catch (error) {
      // 오류 로그 출력
      console.error("댓글 등록 중 오류 발생:", error);

      // CORS 문제 디버깅 로그 추가
      if (error.response) {
        console.error("응답 데이터:", error.response.data);
        console.error("응답 상태:", error.response.status);
        console.error("응답 헤더:", error.response.headers);
      } else if (error.request) {
        console.error("요청 데이터:", error.request);
      } else {
        console.error("오류 메시지:", error.message);
      }

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
        {post.writer?.email === currentUser?.email && ( // 작성자와 현재 유저 비교
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
      <CommentSection
        comments={comments}
        onAddComment={handleAddComment}
        writer={currentUser?.nickname || "사용자"}
      />
    </Box>
  );
};

export default PostDetailsPage;
