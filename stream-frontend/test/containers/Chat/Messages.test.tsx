import React from 'react';
import { render, screen } from '@testing-library/react';
import Messages from '../../../src/containers/Chat/Messages';
import { useDataMessages } from '../../../src/providers/DataMessagesProvider';
import { ThemeProvider } from 'styled-components';
import '@testing-library/jest-dom';  // jest-dom 매처 사용을 위한 import

// useDataMessages 모의 설정
jest.mock('../../../src/providers/DataMessagesProvider', () => ({
  useDataMessages: jest.fn(),
}));

// ChatBubble 컴포넌트 모의 처리
jest.mock('amazon-chime-sdk-component-library-react', () => ({
  ChatBubble: ({ variant, senderName, children }: any) => (
    <div data-testid="chat-bubble" className={variant}>
      <strong>{senderName}</strong>: {children}
    </div>
  ),
}));

// Theme 객체 설정
const theme = {
  chat: {
    bgd: '#ffffff',
    containerBorder: '#cccccc',
    maxWidth: '600px',
  },
  mediaQueries: {
    min: {
      md: '@media(min-width: 768px)',
    },
  },
};

// Message 타입을 테스트 파일 내에서 정의
interface Message {
  senderName: string;
  message: string;
  isSelf: boolean;
  timestamp: string;
}

describe('Messages 컴포넌트', () => {
  const mockUseDataMessages = useDataMessages as jest.Mock;

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('메시지가 있을 때 올바르게 렌더링되어야 한다', () => {
    const mockMessages: Message[] = [
      {
        senderName: 'Alice',
        message: 'Hello!',
        isSelf: false,
        timestamp: '2023-10-10T10:00:00Z',
      },
      {
        senderName: 'Bob',
        message: 'Hi, Alice!',
        isSelf: true,
        timestamp: '2023-10-10T10:01:00Z',
      },
    ];

    mockUseDataMessages.mockReturnValue({ messages: mockMessages });

    render(
      <ThemeProvider theme={theme}>
        <Messages />
      </ThemeProvider>
    );

    // 각 메시지가 올바르게 렌더링되는지 확인
    const chatBubbles = screen.getAllByTestId('chat-bubble');
    expect(chatBubbles).toHaveLength(2);

    expect(chatBubbles[0]).toHaveClass('incoming');
    expect(chatBubbles[0]).toHaveTextContent('Alice: Hello!');

    expect(chatBubbles[1]).toHaveClass('outgoing');
    expect(chatBubbles[1]).toHaveTextContent('Bob: Hi, Alice!');
  });

  test('메시지가 없을 때 StyledMessages가 비어있는지 확인', () => {
    mockUseDataMessages.mockReturnValue({ messages: [] });

    const { container } = render(
      <ThemeProvider theme={theme}>
        <Messages />
      </ThemeProvider>
    );

    // container의 첫 번째 자식이 StyledMessages임을 가정
    const styledMessages = container.firstChild as HTMLElement;
    expect(styledMessages).toBeInTheDocument();
    expect(styledMessages).toBeEmptyDOMElement();
  });

  test('메시지가 업데이트될 때 스크롤이 자동으로 이동해야 한다', () => {
    const initialMessages: Message[] = [
      {
        senderName: 'Alice',
        message: 'Hello!',
        isSelf: false,
        timestamp: '2023-10-10T10:00:00Z',
      },
    ];

    mockUseDataMessages.mockReturnValue({ messages: initialMessages });

    const { container, rerender } = render(
      <ThemeProvider theme={theme}>
        <Messages />
      </ThemeProvider>
    );

    const styledMessages = container.firstChild as HTMLElement;

    // 초기 렌더링 시 scrollTop이 0인지 확인
    expect(styledMessages.scrollTop).toBe(0);

    // scrollHeight을 모킹
    Object.defineProperty(styledMessages, 'scrollHeight', {
      value: 1000,
      writable: true,
    });

    // 메시지 추가
    const updatedMessages: Message[] = [
      ...initialMessages,
      {
        senderName: 'Bob',
        message: 'Hi, Alice!',
        isSelf: true,
        timestamp: '2023-10-10T10:01:00Z',
      },
    ];

    mockUseDataMessages.mockReturnValue({ messages: updatedMessages });

    rerender(
      <ThemeProvider theme={theme}>
        <Messages />
      </ThemeProvider>
    );

    // 스크롤이 아래로 이동했는지 확인
    expect(styledMessages.scrollTop).toBe(styledMessages.scrollHeight);
  });
});
