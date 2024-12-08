import styled from 'styled-components';

// 커스텀 ChatBubble 스타일 컨테이너
export const CustomChatBubble = styled.div<{ isSelf: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* 항상 왼쪽 정렬 */
  margin: 10px 0 10px 15px; /* 왼쪽에 여백 추가 (15px) */
`;

// 발신자 이름 스타일
export const SenderName = styled.div`
  font-weight: bold;
  font-size: 0.9rem;
  color: #7b3dc8; /* 닉네임 색상 */
  margin-bottom: 5px;
  text-align: left;
`;

// 메시지 박스 스타일
export const MessageBox = styled.div`
  background-color: #f3e8ff; /* 메시지 박스 배경 연보라색 */
  color: #4a2e82; /* 텍스트 색상 */
  border-radius: 12px;
  padding: 10px 15px;
  max-width: 70%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  word-wrap: break-word;
  text-align: left;
`;

// 타임스탬프 스타일
export const Timestamp = styled.div`
  font-size: 0.8rem;
  color: #999;
  margin-top: 5px;
  text-align: left;
`;



// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const StyledChat = styled.aside<any>`
  display: grid;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    'chat-header'
    'messages'
    'chat-input';
  width: 100%;
  height: 100%;
  padding-bottom: 1rem;
  overflow-y: auto;
  background-color: ${(props) => props.theme.chat.bgd};
  box-shadow: 1rem 1rem 3.75rem 0 rgba(0, 0, 0, 0.1);
  border-top: 0.0625rem solid ${(props) => props.theme.chat.containerBorder};
  border-left: 0.0625rem solid ${(props) => props.theme.chat.containerBorder};
  border-right: 0.0625rem solid ${(props) => props.theme.chat.containerBorder};
  ${({ theme }) => theme.mediaQueries.min.md} {
    width: ${(props) => props.theme.chat.maxWidth};
  }
`;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const StyledTitle = styled.div<any>`
  grid-area: chat-header;
  position: relative;
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  margin-bottom: 0.5rem;
  border-bottom: 0.0625rem solid ${(props) => props.theme.chat.headerBorder};
  .ch-title {
    font-size: 1rem;
    color: ${(props) => props.theme.chat.primaryText};
  }
  .close-button {
    margin-left: auto;
    display: flex;
    > * {
      margin-left: 0.5rem;
    }
  }
`;

export const StyledChatInputContainer = styled.div`
  grid-area: chat-input;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 0.75rem;

  .ch-input-wrapper {
    width: 90%;

    .ch-input {
      width: 100%;
    }
  }
`;

export const StyledMessages = styled.div`
  grid-area: messages;
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow-y: auto;
  row-gap: 0.5rem;
`;

