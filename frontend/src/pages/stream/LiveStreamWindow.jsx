import React from "react";
import { CardActions, Button } from "@mui/material";
import { getStreamingApi } from "../../utils/apiConfig";

// 유니코드를 안전하게 Base64 인코딩하기 위한 헬퍼 함수
function toBase64(str) {
  // 유니코드 문자열 안전 인코딩
  return btoa(unescape(encodeURIComponent(str)));
}

const LiveStreamWindow = ({ teamId, studyId, nickname, userEmail }) => {
  const handleStreamingButtonClick = (e) => {
    e.stopPropagation();

    // userEmail을 Base64로 인코딩
    const encodedEmail = toBase64(userEmail);

    // URL에 Base64 인코딩된 이메일을 포함
    const popupUrl = `${getStreamingApi()}?teamId=${encodeURIComponent(teamId)}&studyId=${encodeURIComponent(studyId)}&name=${encodeURIComponent(nickname)}&user=${encodedEmail}`;

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



// import React from "react";
// import { CardActions, Button } from "@mui/material";
// import { getStreamingApi } from "../../utils/apiConfig";

// const LiveStreamWindow = ({ teamId, studyId, nickname, userEmail }) => {
//   const handleStreamingButtonClick = (e) => {
//     // 이벤트 전파 방지
//     e.stopPropagation();

//     // URL을 정상적인 형식으로 수정
//     const popupUrl = `${getStreamingApi()}?teamId=${teamId}&studyId=${studyId}&name=${encodeURIComponent(nickname)}`;

//     // 팝업을 열고 URL 파라미터를 전달
//     window.open(popupUrl, "_blank", "width=900,height=700,scrollbars=yes,resizable=yes");
//   };

//   return (
//     <CardActions sx={{ justifyContent: 'flex-end' }}>
//       <Button
//         variant="outlined"
//         size="small"
//         sx={{ color: (theme) => theme.palette.primary.main }}
//         onClick={handleStreamingButtonClick}
//       >
//         스트리밍
//       </Button>
//     </CardActions>
//   );
// };

// export default LiveStreamWindow;
