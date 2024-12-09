import { Input } from "amazon-chime-sdk-component-library-react";
import React, { ChangeEvent, useState } from "react";
import { useDataMessages } from "../../providers/DataMessagesProvider";
import { StyledChatInputContainer, StyledArrowButton } from "./Styled";

export default function ChatInput() {
  const [message, setMessage] = useState(""); // 메시지 상태
  const { sendMessage } = useDataMessages(); // 메시지 전송 함수

  // 메시지 입력 핸들러
  const handleMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  // Enter 키 입력 핸들러
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSendMessage();
    }
  };

  // 메시지 전송 함수
  const handleSendMessage = () => {
    if (message.trim() !== "") {
      sendMessage(message); // 메시지 전송
      setMessage(""); // 입력창 초기화
    }
  };

  return (
    <StyledChatInputContainer>
      <Input
        value={message}
        onChange={handleMessageChange}
        onKeyPress={handleKeyPress}
        placeholder="대기 중인 메시지"
      />
      
      {/* 채팅 메세지 버튼 */}
      <StyledArrowButton onClick={handleSendMessage}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="white"
      >
        <path d="M8 5v14l11-7z" />
      </svg>
      </StyledArrowButton>

    </StyledChatInputContainer>
  );
}
