import React from "react";
import { CardActions, Button } from "@mui/material";

const LiveStreamWindow = ({ nickname, studyId }) => {
  const handleStreamingButtonClick = (e) => {
    // 이벤트 전파 방지
    e.stopPropagation();

    // URL을 정상적인 형식으로 수정
    const popupUrl = `https://localhost:9000/?studyId=${studyId}&name=${encodeURIComponent(nickname)}`;

    // 팝업을 열고 URL 파라미터를 전달
    window.open(popupUrl, "_blank", "width=900,height=700,scrollbars=yes,resizable=yes");
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
