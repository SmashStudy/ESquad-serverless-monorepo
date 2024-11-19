import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Chat from '../../../src/containers/Chat';
import { useNavigation, NavigationContextType } from '../../../src/providers/NavigationProvider';
import { ThemeProvider } from 'styled-components';
import '@testing-library/jest-dom';  // toBeInTheDocument 사용을 위한 jest-dom 추가

// 필요한 모듈 모의 처리
jest.mock('../../../src/providers/NavigationProvider', () => ({
  useNavigation: jest.fn(),
}));
jest.mock('../../../src/containers/Chat/Messages', () => () => <div>Messages Component</div>);
jest.mock('../../../src/containers/Chat/ChatInput', () => () => <div>ChatInput Component</div>);

// IconButton과 Remove 컴포넌트를 모의 처리
jest.mock('amazon-chime-sdk-component-library-react', () => ({
  IconButton: (props: any) => <button onClick={props.onClick}>{props.label}</button>,
  Remove: () => <span>Remove Icon</span>, // Remove 컴포넌트 모의 처리 추가
}));

// 테스트에 사용할 테마 객체 설정
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

describe('Chat 컴포넌트', () => {
  let mockToggleChat: jest.Mock;

  beforeEach(() => {
    // 모든 테스트 전에 기본 mock 설정
    mockToggleChat = jest.fn();
    (useNavigation as jest.Mock).mockReturnValue({ toggleChat: mockToggleChat } as unknown as NavigationContextType);
  });

  test('채팅 제목과 닫기 버튼이 렌더링되어야 한다', () => {
    render(
      <ThemeProvider theme={theme}>
        <Chat />
      </ThemeProvider>
    );

    // 채팅 제목이 렌더링되었는지 확인
    expect(screen.getByText('채팅')).toBeInTheDocument();

    // 닫기 버튼이 렌더링되었는지 확인
    const closeButton = screen.getByText('Close');
    expect(closeButton).toBeInTheDocument();

    // 닫기 버튼 클릭 시 toggleChat 함수가 호출되는지 확인
    fireEvent.click(closeButton);
    expect(mockToggleChat).toHaveBeenCalled();
  });

  test('Messages와 ChatInput 컴포넌트가 렌더링되어야 한다', () => {
    render(
      <ThemeProvider theme={theme}>
        <Chat />
      </ThemeProvider>
    );

    // Messages 컴포넌트가 렌더링되었는지 확인
    expect(screen.getByText('Messages Component')).toBeInTheDocument();

    // ChatInput 컴포넌트가 렌더링되었는지 확인
    expect(screen.getByText('ChatInput Component')).toBeInTheDocument();
  });
});
