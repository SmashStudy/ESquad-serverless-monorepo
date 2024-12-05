import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DevicePermissionControl from '../../../src/containers/DevicePermissionControl/DevicePermissionControl';
import { useMeetingManager, DeviceLabels } from 'amazon-chime-sdk-component-library-react';
import '@testing-library/jest-dom';

// amazon-chime-sdk-component-library-react의 컴포넌트와 훅을 모킹
jest.mock('amazon-chime-sdk-component-library-react', () => ({
  ControlBarButton: ({ icon, onClick, label }: any) => (
    <button onClick={onClick} aria-label={label}>
      {icon}
      {label}
    </button>
  ),
  Cog: () => <span data-testid="icon-cog" />,
  Camera: () => <span data-testid="icon-camera" />,
  Sound: () => <span data-testid="icon-sound" />,
  Dots: () => <span data-testid="icon-dots" />,
  useMeetingManager: jest.fn(),
  DeviceLabels: {
    None: 'None',
    Audio: 'Audio',
    Video: 'Video',
    AudioAndVideo: 'AudioAndVideo',
  },
}));

// DevicePermissionPrompt 컴포넌트를 모킹
jest.mock('../../../src/containers/DevicePermissionPrompt', () => () => (
  <div data-testid="device-permission-prompt" />
));

describe('DevicePermissionControl 컴포넌트', () => {
  const mockInvokeDeviceProvider = jest.fn();
  const mockUseMeetingManager = useMeetingManager as jest.Mock;

  beforeEach(() => {
    // useMeetingManager 훅을 모킹하여 mockInvokeDeviceProvider 함수를 반환하도록 설정
    mockUseMeetingManager.mockReturnValue({
      invokeDeviceProvider: mockInvokeDeviceProvider,
    });
  });

  afterEach(() => {
    // 모든 모킹된 함수 초기화
    jest.clearAllMocks();
  });

  test('deviceLabels가 AudioAndVideo일 때 Cog 아이콘과 "장치" 레이블이 렌더링되어야 한다', () => {
    // AudioAndVideo 레이블로 컴포넌트 렌더링
    render(<DevicePermissionControl deviceLabels={DeviceLabels.AudioAndVideo} />);

    // "장치"라는 이름을 가진 버튼이 렌더링되었는지 확인
    const button = screen.getByRole('button', { name: '장치' });
    expect(button).toBeInTheDocument();

    // Cog 아이콘이 렌더링되었는지 확인
    const cogIcon = screen.getByTestId('icon-cog');
    expect(cogIcon).toBeInTheDocument();

    // DevicePermissionPrompt 컴포넌트가 렌더링되었는지 확인
    const prompt = screen.getByTestId('device-permission-prompt');
    expect(prompt).toBeInTheDocument();
  });

  test('deviceLabels가 Audio일 때 Sound 아이콘과 "오디오" 레이블이 렌더링되어야 한다', () => {
    // Audio 레이블로 컴포넌트 렌더링
    render(<DevicePermissionControl deviceLabels={DeviceLabels.Audio} />);

    // "오디오"라는 이름을 가진 버튼이 렌더링되었는지 확인
    const button = screen.getByRole('button', { name: '오디오' });
    expect(button).toBeInTheDocument();

    // Sound 아이콘이 렌더링되었는지 확인
    const soundIcon = screen.getByTestId('icon-sound');
    expect(soundIcon).toBeInTheDocument();

    // DevicePermissionPrompt 컴포넌트가 렌더링되었는지 확인
    const prompt = screen.getByTestId('device-permission-prompt');
    expect(prompt).toBeInTheDocument();
  });

  test('deviceLabels가 Video일 때 Camera 아이콘과 "비디오" 레이블이 렌더링되어야 한다', () => {
    // Video 레이블로 컴포넌트 렌더링
    render(<DevicePermissionControl deviceLabels={DeviceLabels.Video} />);

    // "비디오"라는 이름을 가진 버튼이 렌더링되었는지 확인
    const button = screen.getByRole('button', { name: '비디오' });
    expect(button).toBeInTheDocument();

    // Camera 아이콘이 렌더링되었는지 확인
    const cameraIcon = screen.getByTestId('icon-camera');
    expect(cameraIcon).toBeInTheDocument();

    // DevicePermissionPrompt 컴포넌트가 렌더링되었는지 확인
    const prompt = screen.getByTestId('device-permission-prompt');
    expect(prompt).toBeInTheDocument();
  });

  test('deviceLabels가 None일 때 아무것도 렌더링되지 않아야 한다', () => {
    // None 레이블로 컴포넌트 렌더링
    render(<DevicePermissionControl deviceLabels={DeviceLabels.None} />);

    // 버튼이 렌더링되지 않았는지 확인
    const button = screen.queryByRole('button');
    expect(button).not.toBeInTheDocument();

    // DevicePermissionPrompt 컴포넌트가 렌더링되지 않았는지 확인
    const prompt = screen.queryByTestId('device-permission-prompt');
    expect(prompt).not.toBeInTheDocument();
  });

  test('버튼 클릭 시 invokeDeviceProvider가 올바른 인자로 호출되어야 한다', () => {
    // Audio 레이블로 컴포넌트 렌더링
    render(<DevicePermissionControl deviceLabels={DeviceLabels.Audio} />);

    // "오디오"라는 이름을 가진 버튼을 찾고 클릭 이벤트 발생
    const button = screen.getByRole('button', { name: '오디오' });
    fireEvent.click(button);

    // invokeDeviceProvider 함수가 Audio 레이블과 함께 호출되었는지 확인
    expect(mockInvokeDeviceProvider).toHaveBeenCalledWith(DeviceLabels.Audio);
  });
});
