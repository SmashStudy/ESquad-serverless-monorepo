import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Typography,
  InputBase,
  Chip,
  TextField,
} from "@mui/material";
import { useTheme } from "@mui/material";
import { Autocomplete } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getCommunityApi, getUserApi } from "../../utils/apiConfig";

const PostCreationPage = ({ onCancel, setIsDraft, onSubmit }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  // 유저 정보 상태
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [activeTab, setActiveTab] = useState("질문");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);

  // 유저 정보 가져오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("jwtToken");

        if (!token) {
          throw new Error("로그인이 필요합니다.");
        }

        const url = `${getUserApi()}/get-user-info`;

        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserInfo(response.data);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            err.message ||
            "유저 정보를 불러오는 중 오류가 발생했습니다."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  const boardType =
    activeTab === "질문"
      ? "questions"
      : activeTab === "자유"
      ? "general"
      : "team-recruit";

  // 탭 변경 함수
  const handleTabChange = (tab) => {
    setActiveTab(tab); // 탭 변경
    setTitle(""); // 제목 초기화
    setContent(""); // 내용 초기화
    setTags([]); // 태그 초기화
    setIsDraft(false); // 드래프트 상태 초기화
  };
  const renderTabContent = () => {
    const studyTemplate = `[스터디 모집 내용 예시]
• 스터디 주제 :
• 스터디 목표 :
• 예상 스터디 일정(횟수) :
• 예상 커리큘럼 간략히 :
• 예상 모집인원 :
• 스터디 소개와 개설 이유 :
• 스터디 관련 주의사항 :
• 스터디에 지원할 수 있는 방법을 남겨주세요. (이메일, 카카오 오픈채팅방, 구글폼 등.) :
`;

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
        setIsDraft(true);
      }
    };

    const handleTagChange = (event, newValue, reason) => {
      if (reason === "clear") {
        setTags([]);
        setIsDraft(true);
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
        setIsDraft(true);
      }
    };

    return (
      <>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            px: 1,
            mb: 3,
          }}
        >
          <InputBase
            placeholder={
              activeTab === "질문"
                ? "제목에 핵심 내용을 요약해보세요."
                : activeTab === "자유"
                ? "자유게시판 제목을 입력하세요."
                : "스터디 제목을 입력하세요."
            }
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setIsDraft(true);
            }}
            sx={{
              width: "100%",
              p: 1,
              borderBottom: "1px solid #ccc",
              fontSize: "1.4rem",
              fontWeight: "bolder",
            }}
          />
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
          <Typography variant="h8" sx={{ px: 1 }}>
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
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, px: 1 }}>
          {activeTab === "스터디" ? (
            <TextField
              defaultValue={studyTemplate}
              onChange={(e) => {
                setContent(e.target.value);
                setIsDraft(true);
              }}
              multiline
              minRows={15}
              variant="standard"
              InputProps={{
                disableUnderline: true,
              }}
              sx={{
                width: "100%",
                p: 2,
                backgroundColor: "#f9f9f9",
                border: "1px solid #ccc",
                borderRadius: 1,
                outline: "none",
              }}
            />
          ) : (
            <InputBase
              placeholder={
                activeTab === "질문"
                  ? " - 학습 관련 질문을 남겨주세요. 상세히 작성하면 더 좋아요! \n - 서로 예의를 지키며 존중하는 게시판을 만들어주세요!"
                  : "자유롭게 글을 적으세요!"
              }
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                setIsDraft(true);
              }}
              multiline
              minRows={15}
              sx={{
                width: "100%",
                p: 2,
                border: "1px solid #ccc",
                borderRadius: 1,
              }}
            />
          )}
        </Box>
      </>
    );
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      alert("내용을 입력해주세요.");
      return;
    }
    try {
      const url = `${getCommunityApi()}/${boardType}`;

      const data = {
        title,
        content,
        writer: {
          name: userInfo.name,
          nickname: userInfo.nickname,
          email: userInfo.email,
        },
        tags: tags, // 태그가 없어도 빈 배열로 설정
        ...(boardType === "team-recruit" && { recruitStatus: false }),
      };

      const response = await axios.post(url, data);

      if (response.status === 201) {
        alert("게시글이 성공적으로 등록되었습니다.");
        setIsDraft(false);
        onSubmit();
        navigate(`/community/${boardType}`);
      } else {
        alert("게시글 등록에 실패했습니다. 다시 시도해주세요.");
      }
    } catch (error) {
      console.error("Error during post submission:", error);
      alert("서버 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        maxWidth: "650px",
        height: "80vh",
        mx: "auto",
        my: "auto",
        py: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          gap: 3,
          mb: 2,
          borderBottom: `1px solid ${theme.palette.primary.light}`,
        }}
      >
        {["질문", "자유", "스터디"].map((tab) => (
          <Button
            key={tab}
            variant="text"
            onClick={() => handleTabChange(tab)}
            sx={{
              fontSize: "large",
              fontWeight: activeTab === tab ? "bold" : "normal",
              borderBottom: activeTab === tab ? "2px solid" : "none",
              borderColor:
                activeTab === tab ? theme.palette.primary.main : "transparent",
            }}
          >
            {tab}
          </Button>
        ))}
      </Box>

      {renderTabContent()}

      <Box
        sx={{ display: "flex", justifyContent: "space-between", mt: 3, px: 1 }}
      >
        <Button
          variant="contained"
          onClick={onCancel}
          sx={{
            color: "#fff",
            backgroundColor: theme.palette.warning.main,
            px: 4,
          }}
        >
          취소
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          sx={{
            backgroundColor: theme.palette.primary.main,
            color: "#fff",
            px: 4,
          }}
        >
          등록
        </Button>
      </Box>
    </Box>
  );
};

export default PostCreationPage;
