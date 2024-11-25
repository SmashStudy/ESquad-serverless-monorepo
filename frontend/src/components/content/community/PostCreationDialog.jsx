import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import PostCreationPage from "../../../pages/community/PostCreationPage.jsx";

const PostCreationDialog = ({ open, onClose }) => {
  const [isDraft, setIsDraft] = useState(false); // 작성 상태
  const [showWarning, setShowWarning] = useState(false); // 경고 모달 상태
  const [isSubmitting, setIsSubmitting] = useState(false); // 등록 중 상태

  // 글 작성 상태 변경 감지
  useEffect(() => {
    if (!open) {
      // 모달이 닫힐 때 초기화
      setIsDraft(false);
      setShowWarning(false);
      setIsSubmitting(false);
    }
  }, [open]);

  // 취소 버튼 클릭 시 동작
  const handleCancel = () => {
    if (!isSubmitting && isDraft) {
      // 등록 중이 아니고 작성 중 상태일 경우에만 경고 모달 표시
      setShowWarning(true);
    } else if (!isSubmitting) {
      // 등록 중이 아니고 작성 중이 아니면 바로 닫기
      onClose();
    }
  };

  // 경고 모달에서 "나가기" 클릭 시
  const handleLeave = () => {
    setShowWarning(false); // 경고 모달 닫기
    setIsDraft(false); // 작성 상태 초기화
    onClose(); // 모달 닫기
  };

  // 경고 모달에서 "취소" 클릭 시
  const handleKeepWriting = () => {
    setShowWarning(false);
  };

  // 등록 버튼 클릭 시 처리
  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      onClose();
    } catch (error) {
      console.error("등록 중 오류 발생:", error);
    } finally {
      setIsSubmitting(false);
      setIsDraft(false);
    }
  };

  return (
    <>
      {/* 작성 모달 */}
      <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
        <DialogContent>
          {/* PostCreationPage 컴포넌트로 작성 상태 전달 */}
          <PostCreationPage
            onCancel={handleCancel}
            setIsDraft={setIsDraft}
            onSubmit={handleSubmit}
          />
        </DialogContent>
      </Dialog>

      {/* 작성 중 경고 모달 */}
      <Dialog
        open={showWarning}
        onClose={handleKeepWriting}
        sx={{
          "& .MuiPaper-root": {
            borderRadius: "12px",
          },
        }}
      >
        <DialogContent>
          <Typography
            variant="h6"
            gutterBottom
            sx={{
              fontSize: "1.25rem",
              fontWeight: "bold",
            }}
          >
            작성 취소
          </Typography>
          <Typography>
            앗! 작성 중인 글이 있어요. 정말 이동하시겠어요?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleKeepWriting}
            variant="outlined"
            sx={{
              color: "black",
              borderColor: "black",
            }}
          >
            취소
          </Button>
          <Button
            onClick={handleLeave}
            variant="contained"
            sx={{
              backgroundColor: "#9F51E8",
              color: "white",
              "&:hover": {
                backgroundColor: "#7E3DBA",
              },
            }}
          >
            나가기
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PostCreationDialog;
