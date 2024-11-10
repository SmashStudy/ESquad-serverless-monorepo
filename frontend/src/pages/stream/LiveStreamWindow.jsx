import React from "react";

const LiveStreamWindow = ({ username }) => {
  const handleStreamingButtonClick = (e) => {
    // 이벤트 전파 방지
    e.stopPropagation();
    const popupUrl = `https://webrtc.store/esquad?name=${encodeURIComponent(
      username
    )}`;
    window.open(popupUrl, "_blank", "width=800,height=600");
  };

  return (
    <div>
      <button onClick={handleStreamingButtonClick}>스트리밍</button>
    </div>
  );
};

export default LiveStreamWindow;
