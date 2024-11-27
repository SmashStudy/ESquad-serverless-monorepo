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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CommentSection from "./CommentSection";

const PostDetailsPage = () => {
  const { boardType, postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);

  const createdAt = new URLSearchParams(window.location.search).get(
    "createdAt"
  );

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
          `https://api.esquad.click/api/community/${boardType}/${postId}`,
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

  const handleAddComment = (content) => {
    const newComment = {
      id: comments.length + 1,
      writer: "현재 사용자", // 실제 사용자 정보
      content,
      createdAt: new Date().toISOString(),
    };
    setComments((prev) => [newComment, ...prev]);
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
      {/* 뒤로가기 버튼 */}
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

      {/* 제목 */}
      <Typography variant="h4" fontWeight="bold" mb={1}>
        {post.title}
      </Typography>

      {/* 작성자, 작성 시간, 조회수, 좋아요 */}
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

      {/* 상태 표시 */}
      {boardType === "questions" && post.resolved && (
        <Typography
          sx={{
            color: "primary.main",
            fontWeight: "bold",
            fontSize: "1rem",
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 2,
          }}
        >
          ✅ 해결된 질문
        </Typography>
      )}

      <Divider sx={{ marginBottom: 3 }} />

      {/* 내용 */}
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

      {/* 댓글 섹션 */}
      <Typography variant="h6" fontWeight="bold" mb={2}>
        댓글
      </Typography>
      <Box sx={{ mb: 3 }}>
        {comments.map((comment) => (
          <Paper
            key={comment.id}
            elevation={1}
            sx={{
              padding: 2,
              mb: 2,
              backgroundColor: "#f5f5f5",
              borderRadius: 2,
            }}
          >
            <Typography variant="body2" fontWeight="bold" mb={1}>
              {comment.writer}
            </Typography>
            <Typography
              variant="body2"
              sx={{ whiteSpace: "pre-line" }}
              dangerouslySetInnerHTML={{ __html: comment.content }}
            />
            <Typography variant="caption" color="text.secondary">
              {new Date(comment.createdAt).toLocaleString()}
            </Typography>
          </Paper>
        ))}
      </Box>

      {/* 댓글 작성 */}
      <CommentSection
        onAddComment={handleAddComment}
        nickname={post.writer?.nickname || "익명"}
      />
    </Box>
  );
};

export default PostDetailsPage;
