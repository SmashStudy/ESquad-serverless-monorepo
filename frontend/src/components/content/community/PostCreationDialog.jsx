import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import PostCreationPage from "../../../pages/community/PostCreationPage.jsx";

const PostCreationDialog = ({ open, onClose }) => {
  const [isDraft, setIsDraft] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  const handleCancel = () => {
    if (isDraft) {
      setShowWarning(true);
    } else {
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

  return (
    <>
      {/* 작성 모달 */}
      <Dialog open={open} onClose={handleCancel} maxWidth="md" fullWidth>
        <DialogContent>
          <PostCreationPage onCancel={handleCancel} setIsDraft={setIsDraft} />
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
