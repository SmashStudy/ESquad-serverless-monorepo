import React, { useState, useEffect, useCallback } from "react";
import { Box, Button, Typography, List, InputBase, Chip } from "@mui/material";
import { alpha, useTheme } from "@mui/material";
import PostCreationDialog from "../../components/content/community/PostCreationDialog.jsx";
import { Link, useLocation } from "react-router-dom";

const PostListPage = ({ isSmallScreen, isMediumScreen }) => {
  const theme = useTheme();
  const location = useLocation();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [teamId, setTeamId] = useState(1); // 임시로 팀 ID 설정
  const [texts, setText] = useState([]);

  // URL 경로에 따라 boardType 설정
  const getBoardTypeFromPath = useCallback(() => {
    if (location.pathname.includes("team-recruit")) {
      setText(["전체", "모집중", "모집완료"]);
      return "team-recruit";
    } else if (location.pathname.includes("questions")) {
      setText(["전체", "미해결", "해결됨"]);
      return "questions";
    } else if (location.pathname.includes("general")) {
      setText([]); // 자유게시판에서는 텍스트를 비워서 탭을 숨김
      return "general";
    } else {
      setText(["전체", "미해결", "해결됨"]);
      return "questions";
    }
  }, [location.pathname]);

  const [boardType, setBoardType] = useState(getBoardTypeFromPath);

  const fetchPosts = useCallback(async () => {
    try {
      const response = await fetch(
        `https://api.esquad.click/api/community/${boardType}?limit=10`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }
      const data = await response.json();
      setPosts(data.items);
    } catch (err) {
      console.error("게시글을 불러오는 중 오류가 발생했습니다:", err);
    }
  }, [boardType]);

  useEffect(() => {
    setBoardType(getBoardTypeFromPath());
  }, [location.pathname, getBoardTypeFromPath]);

  useEffect(() => {
    fetchPosts();
  }, [boardType, fetchPosts]);

  const handleWriteButtonClick = () => {
    setIsPostModalOpen(true);
  };

  const handleClosePostModal = () => {
    setIsPostModalOpen(false);
    fetchPosts();
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
          {/* texts 배열이 비어 있지 않을 때만 버튼 표시 */}
          {texts.length > 0 && (
            <>
              <Button
                variant="text"
                sx={{
                  fontSize: "medium",
                  fontWeight: "bold",
                  borderBottom: boardType === "general" ? "2px solid" : "none",
                  borderColor: theme.palette.primary.main,
                }}
                onClick={() => setBoardType("general")}
              >
                {texts[0]}
              </Button>
              <Button
                variant="text"
                sx={{
                  fontSize: "medium",
                  borderBottom:
                    boardType === "questions" ? "2px solid" : "none",
                  borderColor: theme.palette.primary.main,
                }}
                onClick={() => setBoardType("questions")}
              >
                {texts[1]}
              </Button>
              <Button
                variant="text"
                sx={{
                  fontSize: "medium",
                  borderBottom: boardType === "resolved" ? "2px solid" : "none",
                  borderColor: theme.palette.primary.main,
                }}
                onClick={() => setBoardType("resolved")}
              >
                {texts[2]}
              </Button>
            </>
          )}
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
            to={`/community/${boardType}/questions/${post.postId}`}
            key={post.postId}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <Box
              key={post.postId}
              sx={{
                mb: 2,
                borderBottom: "1px solid #ddd",
                px: 2,
                py: 2,
                backgroundColor: "#f9f6ff",
                "&:hover": {
                  backgroundColor: alpha(theme.palette.primary.light, 0.1),
                  cursor: "pointer",
                },
                display: "flex",
                flexDirection: "column",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                {/* 게시판 타입에 따른 상태 표시 */}
                {boardType === "questions" && (
                  <Chip
                    label={post.resolved ? "해결됨" : "미해결"}
                    color={post.resolved ? "success" : "error"}
                    variant="filled"
                    sx={{
                      mr: 2,
                      borderRadius: "16px",
                      color: "#fff",
                      backgroundColor: post.resolved
                        ? theme.palette.success.main
                        : "#ff6b6b",
                    }}
                  />
                )}

                {boardType === "team-recruit" && (
                  <Chip
                    label={post.recruitStatus ? "모집완료" : "모집중"}
                    color={post.recruitStatus ? "default" : "primary"}
                    variant="filled"
                    sx={{
                      mr: 2,
                      borderRadius: "16px",
                      color: "#fff",
                      backgroundColor: post.recruitStatus
                        ? "#b0bec5"
                        : theme.palette.primary.main,
                    }}
                  />
                )}

                {/* 제목 */}
                <Typography variant="body1" fontWeight="bold">
                  {post.title}
                </Typography>
              </Box>

              {/* 게시글 내용 일부 표시 */}
              <Typography
                variant="body2"
                sx={{ color: theme.palette.grey[700], mb: 1 }}
              >
                {post.content.substring(0, 100)}...
              </Typography>

              {/* 태그 표시 */}
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                {post.tags.length > 0 ? (
                  post.tags.map((tag, idx) => (
                    <Chip
                      key={idx}
                      label={tag}
                      variant="outlined"
                      sx={{
                        borderRadius: "16px",
                        color: theme.palette.primary.main,
                        borderColor: theme.palette.primary.main,
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    태그 없음
                  </Typography>
                )}
              </Box>

              {/* 작성자 및 작성일 표시 */}
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                {post.writer?.name || "익명"} ·{" "}
                {new Date(post.createdAt).toLocaleString()}
              </Typography>

              {/* 좋아요, 조회수, 댓글 수 왼쪽 정렬 */}
              <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
                <Typography variant="caption">
                  👍 {post.likeCount || 0}
                </Typography>
                <Typography variant="caption">
                  👁 {post.viewCount || 0}
                </Typography>
                <Typography variant="caption">
                  💬 {post.comments?.length || 0}
                </Typography>
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
          flexWrap: "wrap",
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
