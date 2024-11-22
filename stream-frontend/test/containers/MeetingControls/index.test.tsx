import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import MeetingControls from '../../../src/containers/MeetingControls';
import { useUserActivityState } from 'amazon-chime-sdk-component-library-react';
import { useNavigation } from '../../../src/providers/NavigationProvider';
import { useAppState } from '../../../src/providers/AppStateProvider';
import '@testing-library/jest-dom';
import { VideoFiltersCpuUtilization } from '../../../src/types'; // 정확한 경로로 임포트

// 필요한 컴포넌트와 훅들을 모킹합니다.
jest.mock('amazon-chime-sdk-component-library-react', () => ({
  ControlBar: ({ children, ...props }: { children: React.ReactNode }) => (
    <div data-testid="control-bar" {...props}>{children}</div>
  ),
  AudioInputVFControl: () => <div data-testid="audio-input-vf-control" />,
  AudioInputControl: () => <div data-testid="audio-input-control" />,
  ContentShareControl: () => <div data-testid="content-share-control" />,
  AudioOutputControl: () => <div data-testid="audio-output-control" />,
  ControlBarButton: ({ onClick, label }: { onClick: () => void; label: string }) => (
    <button data-testid="control-bar-button" onClick={onClick}>{label}</button>
  ),
  useUserActivityState: jest.fn(),
  Dots: () => <div data-testid="dots-icon" />,
  VideoInputControl: () => <div data-testid="video-input-control" />,
}));

jest.mock('../../../src/containers/EndMeetingControl', () => () => <div data-testid="end-meeting-control" />);
jest.mock('../../../src/providers/NavigationProvider', () => ({
  useNavigation: jest.fn(),
}));
jest.mock('../../../src/providers/AppStateProvider', () => ({
  useAppState: jest.fn(),
}));
jest.mock('../../../src/components/MeetingControls/VideoInputTransformControl', () => () => <div data-testid="video-input-transform-control" />);

// StyledControls 컴포넌트 모킹 수정
jest.mock('../../../src/containers/MeetingControls/Styled', () => ({
  StyledControls: ({ children, active, ...props }: { children: React.ReactNode; active: boolean }) => (
    <div data-testid="styled-controls" data-active={active} {...props}>{children}</div>
  ),
}));

describe('MeetingControls 컴포넌트', () => {
  const mockToggleNavbar = jest.fn();
  const mockCloseRoster = jest.fn();
  const mockUseNavigation = useNavigation as jest.Mock;
  const mockUseUserActivityState = useUserActivityState as jest.Mock;
  const mockUseAppState = useAppState as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigation.mockReturnValue({
      toggleNavbar: mockToggleNavbar,
      closeRoster: mockCloseRoster,
      showRoster: false,
    });
    mockUseUserActivityState.mockReturnValue({
      isUserActive: true,
    });
    mockUseAppState.mockReturnValue({
      isWebAudioEnabled: false,
      videoTransformCpuUtilization: VideoFiltersCpuUtilization.CPU10Percent, // 수정된 부분
    });
  });

  test('컴포넌트가 올바르게 렌더링되는지 확인합니다.', () => {
    render(<MeetingControls />);

    expect(screen.getByTestId('styled-controls')).toBeInTheDocument();
    expect(screen.getByTestId('control-bar')).toBeInTheDocument();
    expect(screen.getByTestId('control-bar-button')).toBeInTheDocument();
    expect(screen.getByTestId('control-bar-button')).toHaveTextContent('Menu');
    expect(screen.getByTestId('audio-input-control')).toBeInTheDocument();
    expect(screen.getByTestId('video-input-transform-control')).toBeInTheDocument();
    expect(screen.getByTestId('content-share-control')).toBeInTheDocument();
    expect(screen.getByTestId('audio-output-control')).toBeInTheDocument();
    expect(screen.getByTestId('end-meeting-control')).toBeInTheDocument();
  });

  test('Menu 버튼을 클릭하면 toggleNavbar가 호출됩니다.', () => {
    render(<MeetingControls />);

    const menuButton = screen.getByTestId('control-bar-button');
    fireEvent.click(menuButton);

    expect(mockToggleNavbar).toHaveBeenCalled();
  });

  test('isWebAudioEnabled가 true이면 AudioInputVFControl이 렌더링됩니다.', () => {
    mockUseAppState.mockReturnValue({
      isWebAudioEnabled: true,
      videoTransformCpuUtilization: VideoFiltersCpuUtilization.CPU10Percent,
    });

    render(<MeetingControls />);

    expect(screen.getByTestId('audio-input-vf-control')).toBeInTheDocument();
    expect(screen.queryByTestId('audio-input-control')).not.toBeInTheDocument();
  });

  test('videoTransformsEnabled가 false이면 VideoInputControl이 렌더링됩니다.', () => {
    mockUseAppState.mockReturnValue({
      isWebAudioEnabled: false,
      videoTransformCpuUtilization: VideoFiltersCpuUtilization.Disabled,
    });

    render(<MeetingControls />);

    expect(screen.getByTestId('video-input-control')).toBeInTheDocument();
    expect(screen.queryByTestId('video-input-transform-control')).not.toBeInTheDocument();
  });

  test('showRoster가 true이고 Menu 버튼을 클릭하면 closeRoster와 toggleNavbar가 호출됩니다.', () => {
    mockUseNavigation.mockReturnValue({
      toggleNavbar: mockToggleNavbar,
      closeRoster: mockCloseRoster,
      showRoster: true,
    });

    render(<MeetingControls />);

    const menuButton = screen.getByTestId('control-bar-button');
    fireEvent.click(menuButton);

    expect(mockCloseRoster).toHaveBeenCalled();
    expect(mockToggleNavbar).toHaveBeenCalled();
  });

  test('isUserActive가 true이면 StyledControls에 active 속성이 설정됩니다.', () => {
    mockUseUserActivityState.mockReturnValue({
      isUserActive: true,
    });

    render(<MeetingControls />);

    expect(screen.getByTestId('styled-controls')).toHaveAttribute('data-active', 'true');
  });

  test('isUserActive가 false이면 StyledControls에 active 속성이 false로 설정됩니다.', () => {
    mockUseUserActivityState.mockReturnValue({
      isUserActive: false,
    });

    render(<MeetingControls />);

    expect(screen.getByTestId('styled-controls')).toHaveAttribute('data-active', 'false');
  });
});
