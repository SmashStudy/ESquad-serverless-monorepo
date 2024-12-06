import React, { useState, useEffect } from "react";
import { Box, Button, Typography, List, InputBase, Chip } from "@mui/material";
import { alpha, useTheme } from "@mui/material";
import CreateIcon from "@mui/icons-material/Create";
import { Link, useLocation, useParams } from "react-router-dom";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import axios from "axios";
import SearchIcon from "@mui/icons-material/Search";
import ImageIcon from "@mui/icons-material/Image";
import { getCommunityApi } from "../../utils/apiConfig";
import { useTeams } from "../../context/TeamContext.jsx";
import TeamCreationDialog from "../../components/content/community/TeamCreationDialog.jsx";

const PostTeamListPage = ({ isSmallScreen }) => {
  const theme = useTheme();
  const { teamId } = useParams();
  const location = useLocation();
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [posts, setPosts] = useState([]);
  const [curPage, setCurPage] = useState(1);
  const [lastEvaluatedKeys, setLastEvaluatedKeys] = useState([]);
  const [boardType, setBoardType] = useState("");
  const [filterTab, setFilterTab] = useState("전체");
  const [texts, setTexts] = useState([]);

  // URL 경로에 따라 boardType 설정
  useEffect(() => {
    const board = location.pathname.includes("team-recruit")
      ? "team-recruit"
      : location.pathname.includes("questions")
      ? "questions"
      : "general";

    setBoardType(board);
    setTexts(
      board === "team-recruit"
        ? ["전체", "모집중", "모집완료"]
        : board === "questions"
        ? ["전체", "미해결", "해결됨"]
        : []
    );
    setCurPage(1);
    setPosts([]);
    setLastEvaluatedKeys([]);
  }, [location.pathname]);

  const fetchPosts = async (reset = false) => {
    if (!boardType || !teamId) return;

    try {
      const params = {
        limit: 10,
        teamId: teamId, // 현재 선택된 팀의 PK를 teamId로 사용
      };

      if (!reset && lastEvaluatedKeys[curPage - 1]) {
        params.lastEvaluatedKey = JSON.stringify(
          lastEvaluatedKeys[curPage - 1]
        );
      }

      if (boardType === "questions") {
        if (filterTab === "미해결") params.resolved = "false";
        if (filterTab === "해결됨") params.resolved = "true";
      }

      const url = `${getCommunityApi()}/team-questions`; // 동적 API 경로 설정
      const response = await axios.get(url, { params });

      const items = response.data.items || [];

      const newLastEvaluatedKeys = [...lastEvaluatedKeys];
      newLastEvaluatedKeys[curPage] = response.data.lastEvaluatedKey || null;
      setLastEvaluatedKeys(newLastEvaluatedKeys);
    } catch (err) {
      console.error("게시글을 불러오는 중 오류가 발생했습니다:", err);
    }
  };

  useEffect(() => {
    fetchPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boardType, filterTab, curPage, teamId]);

  const handleFilterChange = (filter) => {
    if (filterTab === filter) return;
    setFilterTab(filter);
    setCurPage(1);
    setPosts([]);
    setLastEvaluatedKeys([]);
  };

  const handlePageChange = (direction) => {
    if (direction === "prev" && curPage > 1) {
      setCurPage((prevPage) => prevPage - 1);
    } else if (direction === "next" && lastEvaluatedKeys[curPage]) {
      setCurPage((prevPage) => prevPage + 1);
    }
  };

  const handleWriteButtonClick = () => setIsPostModalOpen(true);

  // 게시글 등록 후 해당 게시판으로 렌더링
  const handleClosePostModal = () => {
    setIsPostModalOpen(false);
    setCurPage(1); // 페이지를 첫 페이지로 초기화
    setPosts([]); // 기존 게시글 데이터 초기화
    setLastEvaluatedKeys([]); // 마지막 평가된 키 초기화
    fetchPosts(true); // 새로 데이터 fetch
  };

  return (
    <Box sx={{ mb: 2, height: "100%", width: "100%", overflow: "auto" }}>
      {/* Filters and Search */}
      <Box sx={{ display: "flex", flexDirection: "column", mb: 3, gap: 2 }}>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {texts.map((text) => (
            <Button
              key={text}
              variant="text"
              sx={{
                fontSize: "medium",
                fontWeight: "bold",
                borderBottom: filterTab === text ? "2px solid" : "none",
                borderColor: theme.palette.primary.main,
              }}
              onClick={() => handleFilterChange(text)}
            >
              {text}
            </Button>
          ))}
        </Box>

        {/* 검색 및 태그 검색 */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            width: "80%",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: "100%",
            }}
          >
            <InputBase
              placeholder=" 궁금한 질문을 검색해보세요!"
              sx={{
                flex: 1,
                height: "50px",
                p: 1.5,
                border: "1px solid #ccc",
                borderRadius: 1,
                transition: "border 0.3s ease",
                "&:focus-within": {
                  border: "2px solid #A020F0",
                },
              }}
              startAdornment={
                <Box sx={{ color: "#000", fontSize: "1.5rem" }}>
                  <SearchIcon />
                </Box>
              }
            />
            <Button
              variant="contained"
              sx={{
                fontSize: "medium",
                backgroundColor: theme.palette.primary.main,
                color: "#fff",
                height: "50px",
                padding: "0 20px",
                "&:hover": { backgroundColor: theme.palette.primary.dark },
              }}
            >
              검색
            </Button>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              width: "100%",
            }}
          ></Box>
        </Box>
      </Box>
      {/* Sort Buttons */}
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
          {["최신순", "정확도순", "답변많은순", "좋아요순"].map(
            (sortOption) => (
              <Button
                key={sortOption}
                variant="text"
                sx={{ color: theme.palette.text.secondary }}
              >
                {sortOption}
              </Button>
            )
          )}
        </Box>
        <Button
          variant="contained"
          onClick={handleWriteButtonClick}
          sx={{
            backgroundColor: "#333",
            color: "#fff",
            mr: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 20px",
            fontSize: "1rem",
            borderRadius: "8px",
            "&:hover": { backgroundColor: "#555" },
          }}
        >
          <CreateIcon sx={{ fontSize: 20, marginRight: 1 }} /> 글쓰기
        </Button>
      </Box>
      {/* 게시글 목록 */}
      <List sx={{ width: "100%", pr: 2 }}>
        {posts.map((post) => {
          const hasImage = /<img[^>]*src=["']([^"']+)["'][^>]*>/.test(
            post.content
          );
          const plainText = post.content.replace(/<[^>]+>/g, "");

          return (
            <Link
              to={`/community/${boardType}/${
                post.postId
              }?createdAt=${encodeURIComponent(post.createdAt)}`}
              key={post.postId}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Box
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
                  {boardType === "questions" && (
                    <Chip
                      label={post.resolved ? "해결됨" : "미해결"}
                      sx={{
                        mr: 2,
                        borderRadius: "16px",
                        fontWeight: "bold",
                        color: post.resolved ? "#FFFFFF" : "#FFFFFF",
                        backgroundColor: post.resolved
                          ? theme.palette.primary.main
                          : "#CED4DA",
                        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                        height: "30px",
                        minWidth: "60px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />
                  )}
                  {boardType === "team-recruit" && (
                    <Chip
                      label={post.recruitStatus ? "모집완료" : "모집중"}
                      sx={{
                        mr: 2,
                        borderRadius: "16px",
                        fontWeight: "bold",
                        color: post.recruitStatus ? "#fff" : "#fff",
                        backgroundColor: post.recruitStatus
                          ? "#CED4DA"
                          : theme.palette.primary.main,
                        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.2)",
                        height: "30px",
                        minWidth: "60px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />
                  )}
                  <Typography variant="body1" fontWeight="bold">
                    {post.title}
                  </Typography>
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    color: theme.palette.grey[700],
                    mb: 1,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {hasImage && <ImageIcon sx={{ fontSize: "large", mr: 2 }} />}
                  <span
                    dangerouslySetInnerHTML={{
                      __html: plainText.substring(0, 100),
                    }}
                  />
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    gap: 1,
                    flexWrap: "wrap",
                    mb: 0,
                    minHeight: "40px",
                  }}
                >
                  {post.tags &&
                    post.tags.length > 0 &&
                    post.tags.map((tag, idx) => (
                      <Chip
                        key={`${post.postId}-${idx}`}
                        label={tag}
                        variant="outlined"
                        sx={{
                          borderRadius: "16px",
                          color: theme.palette.primary.main,
                          borderColor: theme.palette.primary.main,
                        }}
                      />
                    ))}
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mt: 1,
                  }}
                >
                  {/* 작성자와 작성일 */}
                  <Typography variant="caption" color="text.secondary">
                    {post.writer?.nickname || "익명"} ·{" "}
                    {new Date(post.createdAt).toLocaleString()}
                  </Typography>

                  {/* 좋아요, 조회수, 댓글 */}
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="caption">
                      👍 {post.likeCount || 0}
                    </Typography>
                    <Typography variant="caption">
                      👁 {post.viewCount || 0}
                    </Typography>
                    <Typography variant="caption">
                      💬 {post.commentCount || 0}
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Link>
          );
        })}
      </List>
      {/* Pagination */}
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <Button
          onClick={() => handlePageChange("prev")}
          disabled={curPage === 1}
          sx={{ marginRight: 2 }}
        >
          이전
        </Button>
        <Button
          onClick={() => handlePageChange("next")}
          disabled={!lastEvaluatedKeys[curPage]}
        >
          다음
        </Button>
      </Box>
      <TeamCreationDialog
        open={isPostModalOpen}
        onClose={handleClosePostModal}
        teamId={teamId}
      />
    </Box>
  );
};

export default PostTeamListPage;
