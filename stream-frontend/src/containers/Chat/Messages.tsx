import React, { useEffect, useRef } from 'react';
import { useAppState } from "../../providers/AppStateProvider";
import { useDataMessages } from '../../providers/DataMessagesProvider';
import { StyledMessages, CustomChatBubble, SenderName, MessageBox, Timestamp } from './Styled';

function convertMessageToHyperlink(message: string): JSX.Element {
  const urlRegex = /(https?:\/\/[^\s]+)/g; // URL 감지 정규식
  const parts = message.split(urlRegex);

  return (
    <>
      {parts.map((part, index) =>
        urlRegex.test(part) ? (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: '#9f51e8', textDecoration: 'underline' }}
          >
            {part}
          </a>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </>
  );
}

export default function Messages() {
  const { theme } = useAppState(); // 현재 테마 가져오기
  const { messages } = useDataMessages();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) {
      return;
    }
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages.length]);

  const renderMessages = () => {
    return messages.map((message) => (
      <CustomChatBubble isSelf={message.isSelf} key={message.timestamp}>
        {/* 발신자 이름 */}
        <SenderName theme={theme}>{message.senderName}</SenderName>
        {/* 메시지 박스 */}
        <MessageBox>
          {convertMessageToHyperlink(message.message)}
        </MessageBox>
        {/* 타임스탬프 */}
        <Timestamp>{new Date(message.timestamp).toLocaleTimeString()}</Timestamp>
      </CustomChatBubble>
    ));
  };

  return <StyledMessages ref={scrollRef}>{renderMessages()}</StyledMessages>;
}
