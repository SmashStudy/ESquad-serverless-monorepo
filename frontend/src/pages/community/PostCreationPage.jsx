import axios from "axios";
import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  InputBase,
  Chip,
  TextField,
  IconButton,
} from "@mui/material";
import { useTheme } from "@mui/material";
import { Autocomplete } from "@mui/material";
import AttachFileIcon from "@mui/icons-material/AttachFile";
import DeleteIcon from "@mui/icons-material/Delete";
import { useNavigate } from "react-router-dom";

const PostCreationPage = ({ onCancel, setIsDraft, onSubmit }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const userInfo = {
    id: "testwnsgud",
    name: "박준형",
    email: "testwnsgud@example.com",
  };
  const [activeTab, setActiveTab] = useState("질문");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [file, setFile] = useState(null);

  const boardType =
    activeTab === "질문"
      ? "questions"
      : activeTab === "자유"
      ? "general"
      : "team-recruit";

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
        event.preventDefault(); // 기본 엔터 동작 방지

        const newTag = event.target.value.trim();
        if (!newTag) return; // 빈 값 방지

        if (tags.includes(newTag)) {
          alert(`중복된 태그: "${newTag}"는 추가할 수 없습니다.`);
          return;
        }

        if (tags.length >= 10) {
          alert("태그는 최대 10개까지 추가할 수 있습니다.");
          return;
        }

        setTags((prevTags) => [...prevTags, newTag]);
        event.target.value = ""; // 입력창 초기화
        setIsDraft(true);
      }
    };

    const handleTagChange = (event, newValue, reason) => {
      if (reason === "clear") {
        // Clear Button 클릭 시 태그 초기화
        setTags([]);
        setIsDraft(true);
      } else if (
        reason === "removeOption" ||
        reason === "createOption" ||
        reason === "selectOption"
      ) {
        // 중복 태그 제거 및 추가
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
            options={[]} // 자동 완성 옵션 비활성화
            value={tags}
            onChange={(event, newValue, reason) =>
              handleTagChange(event, newValue, reason)
            }
            renderTags={(value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  key={`tag-${index}`}
                  variant="outlined"
                  size="small"
                  label={option}
                  {...getTagProps({ index })}
                />
              ))
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

  const handleFileUpload = (event) => {
    const uploadedFile = event.target.files[0];
    if (uploadedFile) {
      setFile(uploadedFile);
      setIsDraft(true);
    }
  };

  const handleFileDelete = () => {
    setFile(null);
    setIsDraft(true);
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
      const url = `https://api.esquad.click/api/community/${boardType}/new`;

      const data = {
        title,
        content,
        writer: {
          id: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
        },
        tags: tags.length > 0 ? tags : [],
        ...(boardType === "team-recruit" && { recruitStatus: false }),
      };

      const response = await axios.post(url, data);

      if (response.status === 201) {
        alert("게시글이 성공적으로 등록되었습니다.");
        setIsDraft(false);
        onSubmit(); // PostCreationDialog의 onSubmit 호출
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
            onClick={() => setActiveTab(tab)}
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

      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2 }}>
        <Button
          variant="contained"
          component="label"
          startIcon={<AttachFileIcon />}
          sx={{ backgroundColor: theme.palette.primary.main, color: "#fff" }}
        >
          파일 첨부
          <input type="file" hidden onChange={handleFileUpload} />
        </Button>
        {file && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography variant="body2">{`${file.name} (${(
              file.size / 1024
            ).toFixed(2)} KB)`}</Typography>
            <IconButton onClick={handleFileDelete} size="small">
              <DeleteIcon />
            </IconButton>
          </Box>
        )}
      </Box>

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
