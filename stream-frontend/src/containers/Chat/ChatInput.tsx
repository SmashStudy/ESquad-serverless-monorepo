import { Input } from "amazon-chime-sdk-component-library-react";
import React, { ChangeEvent, useState } from "react";
import { useDataMessages } from "../../providers/DataMessagesProvider";
import { StyledChatInputContainer } from "./Styled";

export default function ChatInput() {
  const [message, setMessage] = useState("");
  const { sendMessage } = useDataMessages();

  const handleMessageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  // TODO: 데모에 설치된 React 버전과 구성 요소 라이브러리에서 허용되는 onKeyPress 버전의 불일치로 인해
  // 여기에 키보드 이벤트 유형에 문제가 있습니다.
  // 지금은 키보드 이벤트에 내부적으로 모든 유형과 캐스팅으로 사용하세요.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleKeyPress = (event: any) => {
    if ((event as KeyboardEvent).key === "Enter") {
      sendMessage(message);
      setMessage("");
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
    </StyledChatInputContainer>
  );
}
