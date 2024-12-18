import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import PostTeamCreationPage from "../../../pages/community/PostTeamCreationPage.jsx";

const TeamCreationDialog = ({ open, onClose, teamId }) => {
  const [isDraft, setIsDraft] = useState(false); // 작성 상태
  const [showWarning, setShowWarning] = useState(false); // 경고 모달 상태
  const [isSubmitting, setIsSubmitting] = useState(false); // 등록 중 상태

  useEffect(() => {
    if (!open) {
      setIsDraft(false);
      setShowWarning(false);
      setIsSubmitting(false);
    }
  }, [open]);

  const handleCancel = () => {
    if (!isSubmitting && isDraft) {
      setShowWarning(true);
    } else if (!isSubmitting) {
      onClose();
    }
  };

  const handleLeave = () => {
    setShowWarning(false);
    setIsDraft(false);
    onClose();
  };

  const handleKeepWriting = () => {
    setShowWarning(false);
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      onClose(); // 등록 완료 후 모달 닫기
    } catch (error) {
      alert("등록 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsSubmitting(false);
      setIsDraft(false);
    }
  };

  return (
    <>
      {/* 작성 모달 */}
      <Dialog
        open={open}
        onClose={handleCancel}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiPaper-root": {
            height: "calc(100vh - 90px)",
            maxHeight: "calc(100vh - 70px)",
          },
        }}
      >
        <DialogContent>
          <PostTeamCreationPage
            onCancel={handleCancel}
            setIsDraft={setIsDraft}
            onSubmit={handleSubmit}
            teamId={teamId}
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
          <Typography>작성 중인 글이 있습니다. 정말 나가시겠습니까?</Typography>
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
            계속 작성
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

export default TeamCreationDialog;
