import React from 'react';
import { render, screen } from '@testing-library/react';
import Messages from '../../../src/containers/Chat/Messages';
import { useDataMessages } from '../../../src/providers/DataMessagesProvider';
import { useAppState } from "../../../src/providers/AppStateProvider";
import { ThemeProvider } from 'styled-components';
import '@testing-library/jest-dom';  // jest-dom 매처 사용을 위한 import

// useDataMessages 모의
jest.mock('../../../src/providers/DataMessagesProvider', () => ({
  useDataMessages: jest.fn(),
}));

// useAppState 모의
jest.mock('../../../src/providers/AppStateProvider', () => ({
  useAppState: jest.fn(),
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

// Message 타입 정의
interface Message {
  senderName: string;
  message: string;
  isSelf: boolean;
  timestamp: string;
}

describe('Messages 컴포넌트', () => {
  const mockUseDataMessages = useDataMessages as jest.Mock;
  const mockUseAppState = useAppState as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // useAppState 훅 모킹 (테마 정보 반환)
    mockUseAppState.mockReturnValue({
      theme: {
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
      }
    });
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

    // 메시지 내용 확인
    expect(screen.getByText('Hello!')).toBeInTheDocument();
    expect(screen.getByText('Hi, Alice!')).toBeInTheDocument();
  });

  test('메시지가 없을 때 StyledMessages가 비어있는지 확인', () => {
    mockUseDataMessages.mockReturnValue({ messages: [] });

    const { container } = render(
      <ThemeProvider theme={theme}>
        <Messages />
      </ThemeProvider>
    );

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

    // scrollHeight 모킹
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

    // 스크롤 이동 확인
    expect(styledMessages.scrollTop).toBe(styledMessages.scrollHeight);
  });
});
