import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MeetingDetails from '../../../src/containers/MeetingDetails';
import { useAppState } from '../../../src/providers/AppStateProvider';
import '@testing-library/jest-dom';

// Styled 컴포넌트 모킹
jest.mock('../../../src/containers/MeetingDetails/Styled', () => ({
  StyledList: ({ children, ...props }: { children: React.ReactNode }) => (
    <dl data-testid="styled-list" {...props}>{children}</dl>
  ),
}));

// amazon-chime-sdk-component-library-react 컴포넌트 모킹
jest.mock('amazon-chime-sdk-component-library-react', () => ({
  Flex: ({ children, ...props }: { children: React.ReactNode }) => (
    <div {...props}>{children}</div>
  ),
  Heading: ({ children, ...props }: { children: React.ReactNode }) => (
    <h1 data-testid="heading" {...props}>{children}</h1>
  ),
  PrimaryButton: ({ onClick, label }: { onClick: () => void; label: string }) => (
    <button data-testid="primary-button" onClick={onClick}>{label}</button>
  ),
}));

// useAppState 훅 모킹
jest.mock('../../../src/providers/AppStateProvider', () => ({
  useAppState: jest.fn(),
}));

describe('MeetingDetails 컴포넌트', () => {
  const mockToggleTheme = jest.fn();
  const mockUseAppStateMock = useAppState as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppStateMock.mockReturnValue({
      meetingId: '12345',
      toggleTheme: mockToggleTheme,
      theme: 'light',
      region: 'us-east-1',
    });
  });

  test('회의 정보가 올바르게 렌더링되는지 확인합니다.', () => {
    render(<MeetingDetails />);

    // Heading 컴포넌트가 올바른 텍스트를 표시하는지 확인
    expect(screen.getByTestId('heading')).toHaveTextContent('회의 정보');

    // StyledList 컴포넌트가 렌더링되는지 확인
    expect(screen.getByTestId('styled-list')).toBeInTheDocument();

    // 회의 ID와 실제 값이 표시되는지 확인
    expect(screen.getByText('회의 ID')).toBeInTheDocument();
    expect(screen.getByText('12345')).toBeInTheDocument();

    // 호스트의 리전과 실제 값이 표시되는지 확인
    expect(screen.getByText('호스트의 리전')).toBeInTheDocument();
    expect(screen.getByText('us-east-1')).toBeInTheDocument();
  });

  test('PrimaryButton의 레이블이 현재 테마에 따라 올바르게 표시됩니다. (light 테마)', () => {
    render(<MeetingDetails />);
    expect(screen.getByTestId('primary-button')).toHaveTextContent('어두운 모드');
  });

  test('PrimaryButton의 레이블이 현재 테마에 따라 올바르게 표시됩니다. (dark 테마)', () => {
    mockUseAppStateMock.mockReturnValue({
      meetingId: '12345',
      toggleTheme: mockToggleTheme,
      theme: 'dark',
      region: 'us-east-1',
    });

    render(<MeetingDetails />);
    expect(screen.getByTestId('primary-button')).toHaveTextContent('밝은 모드');
  });

  test('PrimaryButton을 클릭하면 toggleTheme 함수가 호출됩니다.', () => {
    render(<MeetingDetails />);

    const button = screen.getByTestId('primary-button');
    fireEvent.click(button);

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });

  test('회의 ID와 리전이 정확하게 표시됩니다.', () => {
    render(<MeetingDetails />);

    // 회의 ID
    const meetingIdTerm = screen.getByText('회의 ID');
    const meetingIdDesc = screen.getByText('12345');
    expect(meetingIdTerm).toBeInTheDocument();
    expect(meetingIdDesc).toBeInTheDocument();

    // 호스트의 리전
    const regionTerm = screen.getByText('호스트의 리전');
    const regionDesc = screen.getByText('us-east-1');
    expect(regionTerm).toBeInTheDocument();
    expect(regionDesc).toBeInTheDocument();
  });

  test('PrimaryButton의 onClick 이벤트가 정상적으로 작동합니다.', () => {
    render(<MeetingDetails />);

    const button = screen.getByTestId('primary-button');
    fireEvent.click(button);

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
});