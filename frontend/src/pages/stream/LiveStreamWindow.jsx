import React from "react";
import { CardActions, Button } from "@mui/material"; // MUI 컴포넌트 import

const LiveStreamWindow = ({ username, studyId }) => {
  const handleStreamingButtonClick = (e) => {
    // 이벤트 전파 방지
    e.stopPropagation();
    const popupUrl = `https://localhost:9000/studyId=${studyId}?name=${encodeURIComponent(username)}`;
    window.open(popupUrl, "_blank", "width=800,height=600");
  };

  return (
    <CardActions sx={{ justifyContent: 'flex-end' }}>
      <Button
        variant="outlined"
        size="small"
        sx={{ color: (theme) => theme.palette.primary.main }}
        onClick={handleStreamingButtonClick}
      >
        스트리밍
      </Button>
    </CardActions>
  );
};

export default LiveStreamWindow;
