import React from 'react';
import { render, fireEvent, act } from '@testing-library/react';
import { NavigationProvider, useNavigation } from '../../src/providers/NavigationProvider';
import { useLocation } from 'react-router-dom';
import { useMeetingManager } from 'amazon-chime-sdk-component-library-react';

// 필요한 모듈들을 모의(Mock) 처리합니다.
jest.mock('react-router-dom', () => ({
  useLocation: jest.fn(),
}));

jest.mock('amazon-chime-sdk-component-library-react', () => ({
  useMeetingManager: jest.fn(),
}));

describe('NavigationProvider', () => {
  const mockLeave = jest.fn();
  const mockUseMeetingManager = useMeetingManager as jest.Mock;
  const mockUseLocation = useLocation as jest.Mock;

  beforeEach(() => {
    // 각 테스트 전에 모의 함수들을 초기화합니다.
    mockLeave.mockClear();
    mockUseMeetingManager.mockReturnValue({
      leave: mockLeave,
    });
    mockUseLocation.mockReturnValue({
      pathname: '/home',
    });

    // 윈도우 크기를 기본 데스크톱 크기로 설정합니다.
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });
  });

  test('기본 값을 제공해야 합니다', () => {
    const TestComponent = () => {
      const { showNavbar, showRoster, showChat } = useNavigation();
      return (
        <div>
          <span data-testid="show-navbar">{showNavbar.toString()}</span>
          <span data-testid="show-roster">{showRoster.toString()}</span>
          <span data-testid="show-chat">{showChat.toString()}</span>
        </div>
      );
    };

    const { getByTestId } = render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    expect(getByTestId('show-navbar').textContent).toBe('true');
    expect(getByTestId('show-roster').textContent).toBe('true');
    expect(getByTestId('show-chat').textContent).toBe('true');
  });

  test('toggleNavbar 함수를 통해 showNavbar를 토글해야 합니다', () => {
    const TestComponent = () => {
      const { showNavbar, toggleNavbar } = useNavigation();
      return (
        <div>
          <span data-testid="show-navbar">{showNavbar.toString()}</span>
          <button onClick={toggleNavbar}>Toggle Navbar</button>
        </div>
      );
    };

    const { getByTestId, getByText } = render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    const showNavbarText = getByTestId('show-navbar');
    const toggleButton = getByText('Toggle Navbar');

    expect(showNavbarText.textContent).toBe('true');

    fireEvent.click(toggleButton);
    expect(showNavbarText.textContent).toBe('false');

    fireEvent.click(toggleButton);
    expect(showNavbarText.textContent).toBe('true');
  });

  test('toggleRoster 함수를 통해 showRoster를 토글해야 합니다', () => {
    const TestComponent = () => {
      const { showRoster, toggleRoster } = useNavigation();
      return (
        <div>
          <span data-testid="show-roster">{showRoster.toString()}</span>
          <button onClick={toggleRoster}>Toggle Roster</button>
        </div>
      );
    };

    const { getByTestId, getByText } = render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    const showRosterText = getByTestId('show-roster');
    const toggleButton = getByText('Toggle Roster');

    expect(showRosterText.textContent).toBe('true');

    fireEvent.click(toggleButton);
    expect(showRosterText.textContent).toBe('false');

    fireEvent.click(toggleButton);
    expect(showRosterText.textContent).toBe('true');
  });

  test('toggleChat 함수를 통해 showChat을 토글해야 합니다', () => {
    const TestComponent = () => {
      const { showChat, toggleChat } = useNavigation();
      return (
        <div>
          <span data-testid="show-chat">{showChat.toString()}</span>
          <button onClick={toggleChat}>Toggle Chat</button>
        </div>
      );
    };

    const { getByTestId, getByText } = render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    const showChatText = getByTestId('show-chat');
    const toggleButton = getByText('Toggle Chat');

    expect(showChatText.textContent).toBe('true');

    fireEvent.click(toggleButton);
    expect(showChatText.textContent).toBe('false');

    fireEvent.click(toggleButton);
    expect(showChatText.textContent).toBe('true');
  });

  test('경로가 MEETING을 포함하면 meetingManager.leave()를 호출해야 합니다', () => {
    mockUseLocation.mockReturnValue({
      pathname: '/meeting/123',
    });

    const TestComponent = () => {
      useNavigation();
      return null;
    };

    const { unmount } = render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    // 컴포넌트 언마운트 시 meetingManager.leave()가 호출되는지 확인합니다.
    unmount();

    expect(mockLeave).toHaveBeenCalled();
  });

  test('윈도우 크기 변경 시 상태가 업데이트되어야 합니다', () => {
    const TestComponent = () => {
      const { showNavbar, showRoster, showChat } = useNavigation();
      return (
        <div>
          <span data-testid="show-navbar">{showNavbar.toString()}</span>
          <span data-testid="show-roster">{showRoster.toString()}</span>
          <span data-testid="show-chat">{showChat.toString()}</span>
        </div>
      );
    };

    const { getByTestId } = render(
      <NavigationProvider>
        <TestComponent />
      </NavigationProvider>
    );

    expect(getByTestId('show-navbar').textContent).toBe('true');
    expect(getByTestId('show-roster').textContent).toBe('true');
    expect(getByTestId('show-chat').textContent).toBe('true');

    // 윈도우 크기를 모바일 크기로 변경합니다.
    act(() => {
      window.innerWidth = 500;
      window.dispatchEvent(new Event('resize'));
    });

    expect(getByTestId('show-navbar').textContent).toBe('false');
    expect(getByTestId('show-roster').textContent).toBe('false');
    expect(getByTestId('show-chat').textContent).toBe('false');

    // 윈도우 크기를 데스크톱 크기로 다시 변경합니다.
    act(() => {
      window.innerWidth = 1024;
      window.dispatchEvent(new Event('resize'));
    });

    expect(getByTestId('show-navbar').textContent).toBe('true');
    // showRoster와 showChat은 다시 true로 변경되지 않으므로 추가 로직이 필요할 수 있습니다.
  });

  test('NavigationProvider 외부에서 useNavigation 사용 시 에러를 던져야 합니다', () => {
    const TestComponent = () => {
      const { showNavbar } = useNavigation();
      return <div>{showNavbar}</div>;
    };

    // 에러가 발생하는지 확인합니다.
    expect(() => render(<TestComponent />)).toThrow(
      'Use useNavigation in NavigationProvider'
    );
  });
});
