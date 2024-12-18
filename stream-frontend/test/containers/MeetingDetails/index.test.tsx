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

// amazon-chime-sdk-component-library-react 컴포넌트 및 훅 모킹
jest.mock('amazon-chime-sdk-component-library-react', () => {
  const actual = jest.requireActual('amazon-chime-sdk-component-library-react');
  return {
    ...actual,
    Flex: ({ children, container, ...props }: { children: React.ReactNode; container?: boolean }) => (
      <div {...props}>{children}</div>
    ),
    Heading: ({ children, ...props }: { children: React.ReactNode }) => (
      <h1 data-testid="heading" {...props}>{children}</h1>
    ),
    PrimaryButton: ({ onClick, label }: { onClick: () => void; label: string }) => (
      <button data-testid="primary-button" onClick={onClick}>{label}</button>
    ),
    useRosterState: jest.fn().mockReturnValue({ roster: {} }),
  };
});

// useAppState 훅 모킹
jest.mock('../../../src/providers/AppStateProvider', () => ({
  useAppState: jest.fn(),
}));

describe('MeetingDetails 컴포넌트', () => {
  const mockToggleTheme = jest.fn();
  const mockUseAppState = useAppState as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAppState.mockReturnValue({
      meetingId: '12345',
      toggleTheme: mockToggleTheme,
      theme: 'light',
      region: 'us-east-1',
    });
  });

  test('회의 정보가 올바르게 렌더링되는지 확인합니다.', () => {
    render(<MeetingDetails />);

    expect(screen.getByTestId('heading')).toHaveTextContent('회의 정보');
    expect(screen.getByTestId('styled-list')).toBeInTheDocument();

    // 회의 ID
    expect(screen.getByText('회의 ID')).toBeInTheDocument();
    expect(screen.getByText('12345')).toBeInTheDocument();

    // 호스트의 지역 (us-east-1 -> 미국 (버지니아 북부))
    expect(screen.getByText('호스트의 지역')).toBeInTheDocument();
    expect(screen.getByText('미국 (버지니아 북부)')).toBeInTheDocument();
  });

  test('PrimaryButton의 레이블이 현재 테마에 따라 올바르게 표시됩니다. (light 테마)', () => {
    render(<MeetingDetails />);
    expect(screen.getByTestId('primary-button')).toHaveTextContent('어두운 모드');
  });

  test('PrimaryButton의 레이블이 현재 테마에 따라 올바르게 표시됩니다. (dark 테마)', () => {
    mockUseAppState.mockReturnValue({
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

    const meetingIdTerm = screen.getByText('회의 ID');
    const meetingIdDesc = screen.getByText('12345');
    expect(meetingIdTerm).toBeInTheDocument();
    expect(meetingIdDesc).toBeInTheDocument();

    const regionTerm = screen.getByText('호스트의 지역');
    expect(regionTerm).toBeInTheDocument();

    // "us-east-1" -> "미국 (버지니아 북부)" 매핑 확인
    expect(screen.getByText('미국 (버지니아 북부)')).toBeInTheDocument();
  });

  test('PrimaryButton의 onClick 이벤트가 정상적으로 작동합니다.', () => {
    render(<MeetingDetails />);

    const button = screen.getByTestId('primary-button');
    fireEvent.click(button);

    expect(mockToggleTheme).toHaveBeenCalledTimes(1);
  });
});
