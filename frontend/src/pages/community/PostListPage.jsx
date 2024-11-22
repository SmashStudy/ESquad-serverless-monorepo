import React, { useState } from "react";
import { Box, Button, Typography, List, InputBase } from "@mui/material";
import { alpha, useTheme } from "@mui/material";
import PostCreationDialog from "../../components/content/community/PostCreationDialog.jsx";
import { Link } from "react-router-dom";

const PostListPage = ({
  isSmallScreen,
  isMediumScreen,
  boardType = "questions",
}) => {
  const theme = useTheme();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [teamId] = useState(1);

  const handleWriteButtonClick = () => {
    setIsPostModalOpen(true);
  };

  const handleClosePostModal = () => {
    setIsPostModalOpen(false);
    fetchPosts();
  };

  // 게시글 목록 가져오기
  const fetchPosts = async () => {
    try {
      const response = await fetch(`/api/community/${boardType}`);
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  return (
    <Box
      sx={{
        mb: 2,
        height: "100%",
        width: "100%",
        overflowX: "auto",
        overflowY: "auto",
      }}
    >
      {/* Filters and Search */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 3,
          gap: 2,
        }}
      >
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexDirection: "row",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "flex-start",
          }}
        >
          <Button
            variant="text"
            sx={{
              fontSize: "medium",
              fontWeight: "bold",
              borderBottom: "2px solid",
              borderColor: theme.palette.primary.main,
            }}
          >
            전체
          </Button>
          <Button variant="text" sx={{ fontSize: "medium" }}>
            미해결
          </Button>
          <Button variant="text" sx={{ fontSize: "medium" }}>
            해결됨
          </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 2,
            width: "90%",
          }}
        >
          <InputBase
            placeholder="궁금한 질문을 검색해보세요!"
            sx={{
              width: "100%",
              p: 1,
              border: "1px solid #ccc",
              borderRadius: 1,
            }}
          />
          <Button
            variant="contained"
            sx={{
              fontSize: "medium",
              backgroundColor: theme.palette.primary.main,
            }}
          >
            검색
          </Button>
        </Box>
      </Box>

      {/* Sort and Write Button */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexDirection: isSmallScreen ? "column" : "row",
          gap: isSmallScreen ? 2 : 0,
        }}
      >
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          <Button variant="text" sx={{ color: theme.palette.text.secondary }}>
            최신순
          </Button>
          <Button variant="text" sx={{ color: theme.palette.text.secondary }}>
            정확도순
          </Button>
          <Button variant="text" sx={{ color: theme.palette.text.secondary }}>
            답변많은순
          </Button>
          <Button variant="text" sx={{ color: theme.palette.text.secondary }}>
            좋아요순
          </Button>
        </Box>
        <Button
          variant="contained"
          onClick={handleWriteButtonClick}
          sx={{
            backgroundColor: theme.palette.secondary.main,
            color: "#fff",
            mr: 2,
          }}
        >
          글쓰기
        </Button>
      </Box>

      {/* Posts List */}
      <List
        sx={{
          width: "100%",
          pr: 2,
        }}
      >
        {posts.map((post) => (
          <Link
            to={`/teams/${teamId}/questions/${post.id}`}
            key={post.id}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Box
              key={post.id}
              sx={{
                mb: 2,
                borderBottom: "1px solid #ddd",
                px: 2,
                py: 2,
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.light, 0.1),
                  cursor: "pointer",
                },
                display: "flex",
                flexDirection: "column",
                alignItems: isSmallScreen ? "center" : "stretch",
                justifyContent: isSmallScreen ? "center" : "flex-start",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                  flexDirection: isSmallScreen ? "column" : "row",
                }}
              >
                <Button variant="outlined" size="small" disabled>
                  {post.status || "미해결"}
                </Button>
                <Typography variant="body1" fontWeight="bold">
                  {post.title}
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.grey[700], mb: 1 }}
              >
                질문 설명이 여기에 표시됩니다. 질문의 간단한 설명이나 내용을
                보여주는 부분입니다.
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: theme.palette.grey[700], mb: 1 }}
              >
                {post.content.substring(0, 100)}...
              </Typography>

              {/* Tags */}
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                {post.tags?.map((tag, idx) => (
                  <Button
                    key={idx}
                    variant="outlined"
                    size="small"
                    sx={{ borderRadius: 4 }}
                  >
                    {tag}
                  </Button>
                ))}
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexDirection: isSmallScreen ? "column" : "row",
                  gap: isSmallScreen ? 1 : 0,
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {post.writerName} ·{" "}
                  {new Date(post.createdAt).toLocaleString()}
                </Typography>
                <Box
                  sx={{ display: "flex", gap: 2, mt: isSmallScreen ? 1 : 0 }}
                >
                  <Typography variant="caption">👍 {post.likes}</Typography>
                  <Typography variant="caption">👁 {post.views || 0}</Typography>
                  <Typography variant="caption">
                    💬 {post.comments?.length || 0}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Link>
        ))}
      </List>

      {/* Pagination */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexWrap: "wrap", // width: '100%', display: flex 일 때 설정하면 width 안에서 flex 잡음
          justifyContent: "center",
          alignItems: "center",
          my: 3,
        }}
      >
        <Button variant="outlined" sx={{ mx: 1 }}>
          이전
        </Button>
        {[1, 2, 3, 4, 5].map((page) => (
          <Button key={page} variant="text" sx={{ mx: 1 }}>
            {page}
          </Button>
        ))}
        <Button variant="outlined" sx={{ mx: 1 }}>
          다음
        </Button>
      </Box>

      {/* 글 작성 모달 */}
      <PostCreationDialog
        open={isPostModalOpen}
        onClose={handleClosePostModal}
      />
    </Box>
  );
};

export default PostListPage;
