import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import VideoInputTransformControl from '../../../src/components/MeetingControls/VideoInputTransformControl';
import '@testing-library/jest-dom';
import {
  useBackgroundBlur,
  useBackgroundReplacement,
  useVideoInputs,
  useLocalVideo,
  useMeetingManager,
  useLogger,
  isOptionActive,
  lightTheme,
  MeetingProvider,
} from 'amazon-chime-sdk-component-library-react';
import { ThemeProvider } from 'styled-components';
import { useAppState } from '../../../src/providers/AppStateProvider';
import { createBlob } from '../../../src/utils/background-replacement';
import { VideoTransformDevice } from 'amazon-chime-sdk-js';

// 필요한 훅과 모듈을 모의(Mock) 처리
jest.mock('amazon-chime-sdk-component-library-react', () => ({
  ...jest.requireActual('amazon-chime-sdk-component-library-react'),
  useBackgroundBlur: jest.fn(),
  useBackgroundReplacement: jest.fn(),
  useVideoInputs: jest.fn(),
  useLocalVideo: jest.fn(),
  useMeetingManager: jest.fn(),
  useLogger: jest.fn(),
  isOptionActive: jest.fn(),
}));

jest.mock('../../../src/providers/AppStateProvider', () => ({
  useAppState: jest.fn(),
}));

jest.mock('../../../src/utils/background-replacement', () => ({
  createBlob: jest.fn(),
}));

// 프로바이더로 감싸는 유틸리티 함수 생성
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ThemeProvider theme={lightTheme}>
      <MeetingProvider>
        {ui}
      </MeetingProvider>
    </ThemeProvider>
  );
};

describe('VideoInputTransformControl 컴포넌트', () => {
  const mockToggleVideo = jest.fn();
  const mockCreateBackgroundBlurDevice = jest.fn();
  const mockCreateBackgroundReplacementDevice = jest.fn();
  const mockChangeBackgroundReplacementImage = jest.fn();
  const mockStartVideoInputDevice = jest.fn();
  const mockSelectVideoInputDevice = jest.fn();
  const mockLogger = { info: jest.fn(), error: jest.fn() };

  const mockUseAppState = {
    backgroundReplacementOption: 'Default',
    setBackgroundReplacementOption: jest.fn(),
    replacementOptionsList: [{ label: 'Default' }, { label: 'Option 1' }],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    (useLocalVideo as jest.Mock).mockReturnValue({
      isVideoEnabled: true,
      toggleVideo: mockToggleVideo,
    });

    (useVideoInputs as jest.Mock).mockReturnValue({
      devices: [{ deviceId: 'camera1', label: 'Camera 1' }],
      selectedDevice: { deviceId: 'camera1', label: 'Camera 1' },
    });

    (useBackgroundBlur as jest.Mock).mockReturnValue({
      isBackgroundBlurSupported: true,
      createBackgroundBlurDevice: mockCreateBackgroundBlurDevice,
    });

    (useBackgroundReplacement as jest.Mock).mockReturnValue({
      isBackgroundReplacementSupported: true,
      createBackgroundReplacementDevice: mockCreateBackgroundReplacementDevice,
      changeBackgroundReplacementImage: mockChangeBackgroundReplacementImage,
      backgroundReplacementProcessor: true,
    });

    (useMeetingManager as jest.Mock).mockReturnValue({
      startVideoInputDevice: mockStartVideoInputDevice,
      selectVideoInputDevice: mockSelectVideoInputDevice,
    });

    (useLogger as jest.Mock).mockReturnValue(mockLogger);

    (isOptionActive as jest.Mock).mockResolvedValue(false);

    (useAppState as jest.Mock).mockReturnValue(mockUseAppState);

    (createBlob as jest.Mock).mockResolvedValue(new Blob());
  });

  test('컨트롤 바 버튼이 렌더링된다', async () => {
    await act(async () => {
      renderWithProviders(<VideoInputTransformControl />);
    });

    // 'Video' 이름을 가진 모든 버튼을 가져옵니다.
    const buttons = screen.getAllByRole('button', { name: /video/i });

    // 'aria-haspopup' 속성이 없는 버튼이 메인 버튼입니다.
    const mainButton = buttons.find(button => !button.getAttribute('aria-haspopup'));

    expect(mainButton).toBeInTheDocument();
  });

  test('버튼 클릭 시 비디오가 토글된다', async () => {
    await act(async () => {
      renderWithProviders(<VideoInputTransformControl />);
    });

    // 'Video' 이름을 가진 모든 버튼을 가져옵니다.
    const buttons = screen.getAllByRole('button', { name: /video/i });

    // 'aria-haspopup' 속성이 없는 버튼이 메인 버튼입니다.
    const mainButton = buttons.find(button => !button.getAttribute('aria-haspopup'));

    // 버튼이 존재하는지 확인
    expect(mainButton).toBeInTheDocument();

    // 버튼 클릭
    fireEvent.click(mainButton!);

    // toggleVideo 함수가 호출되었는지 확인
    expect(mockToggleVideo).toHaveBeenCalled();
  });

  test('배경 블러 옵션이 지원되면 렌더링된다', async () => {
    await act(async () => {
      renderWithProviders(<VideoInputTransformControl />);
    });
    const buttons = screen.getAllByRole('button', { name: 'Video' });
    const caretButton = buttons.find(button => button.getAttribute('aria-haspopup') === 'true');

    await act(async () => {
      fireEvent.click(caretButton!);
    });

    await waitFor(() => {
      expect(screen.getByText('배경 블러 사용')).toBeInTheDocument();
    });
  });

  test('배경 교체 옵션이 지원되면 렌더링된다', async () => {
    await act(async () => {
      renderWithProviders(<VideoInputTransformControl />);
    });
    const buttons = screen.getAllByRole('button', { name: 'Video' });
    const caretButton = buttons.find(button => button.getAttribute('aria-haspopup') === 'true');

    await act(async () => {
      fireEvent.click(caretButton!);
    });

    await waitFor(() => {
      expect(screen.getByText('배경 교체 사용')).toBeInTheDocument();
    });
  });

  test('배경 블러 옵션 클릭 시 블러 효과가 활성화된다', async () => {
    await act(async () => {
      renderWithProviders(<VideoInputTransformControl />);
    });
    const buttons = screen.getAllByRole('button', { name: 'Video' });
    const caretButton = buttons.find(button => button.getAttribute('aria-haspopup') === 'true');

    await act(async () => {
      fireEvent.click(caretButton!);
    });

    const blurOption = await screen.findByText('배경 블러 사용');

    // createBackgroundBlurDevice 모의 함수가 VideoTransformDevice를 반환하도록 설정
    const mockVideoTransformDevice: VideoTransformDevice = {
      stop: jest.fn(),
      intrinsicDevice: jest.fn(),
    } as unknown as VideoTransformDevice;

    mockCreateBackgroundBlurDevice.mockResolvedValue(mockVideoTransformDevice);

    await act(async () => {
      fireEvent.click(blurOption);
    });

    // createBackgroundBlurDevice가 호출되었는지 확인
    await waitFor(() => {
      expect(mockCreateBackgroundBlurDevice).toHaveBeenCalled();
    });

    // startVideoInputDevice가 mockVideoTransformDevice와 함께 호출되었는지 확인
    expect(mockStartVideoInputDevice).toHaveBeenCalledWith(mockVideoTransformDevice);
  });

  test('배경 교체 옵션 클릭 시 교체 효과가 활성화된다', async () => {
    await act(async () => {
      renderWithProviders(<VideoInputTransformControl />);
    });
    const buttons = screen.getAllByRole('button', { name: 'Video' });
    const caretButton = buttons.find(button => button.getAttribute('aria-haspopup') === 'true');

    await act(async () => {
      fireEvent.click(caretButton!);
    });

    const replacementOption = await screen.findByText('배경 교체 사용');

    // createBackgroundReplacementDevice 모의 함수가 VideoTransformDevice를 반환하도록 설정
    const mockVideoTransformDevice: VideoTransformDevice = {
      stop: jest.fn(),
      intrinsicDevice: jest.fn(),
    } as unknown as VideoTransformDevice;

    mockCreateBackgroundReplacementDevice.mockResolvedValue(mockVideoTransformDevice);

    await act(async () => {
      fireEvent.click(replacementOption);
    });

    // createBackgroundReplacementDevice가 호출되었는지 확인
    await waitFor(() => {
      expect(mockCreateBackgroundReplacementDevice).toHaveBeenCalled();
    });

    // startVideoInputDevice가 mockVideoTransformDevice와 함께 호출되었는지 확인
    expect(mockStartVideoInputDevice).toHaveBeenCalledWith(mockVideoTransformDevice);
  });

  test('다른 배경 교체 옵션 선택 시 옵션이 변경된다', async () => {
    await act(async () => {
      renderWithProviders(<VideoInputTransformControl />);
    });
    const buttons = screen.getAllByRole('button', { name: 'Video' });
    const caretButton = buttons.find(button => button.getAttribute('aria-haspopup') === 'true');

    await act(async () => {
      fireEvent.click(caretButton!);
    });

    const replacementSubMenu = await screen.findByText('배경 교체 필터 선택');

    await act(async () => {
      fireEvent.click(replacementSubMenu);
    });

    const option1 = await screen.findByText('Option 1');

    await act(async () => {
      fireEvent.click(option1);
    });

    // createBlob이 호출되었는지 확인
    await waitFor(() => {
      expect(createBlob).toHaveBeenCalled();
    });

    // changeBackgroundReplacementImage가 호출되었는지 확인
    expect(mockChangeBackgroundReplacementImage).toHaveBeenCalled();

    // setBackgroundReplacementOption이 'Option 1'로 호출되었는지 확인
    expect(mockUseAppState.setBackgroundReplacementOption).toHaveBeenCalledWith('Option 1');
  });
});
