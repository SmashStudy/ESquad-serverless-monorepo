import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { AppStateProvider, useAppState } from '../../src/providers/AppStateProvider';
import { createBlob } from '../../src/utils/background-replacement';
import { VideoFiltersCpuUtilization, ReplacementOptions } from '../../src/types';

// 의존성 모의(Mock)
jest.mock('../../src/utils/background-replacement', () => ({
  createBlob: jest.fn(),
}));

jest.mock('amazon-chime-sdk-component-library-react', () => ({
  useLogger: () => ({
    error: jest.fn(),
  }),
}));

// window.location.search 모의
beforeAll(() => {
  delete (window as any).location;
  (window as any).location = {
    search: '?meetingId=test-meeting&region=us-east-1',
  };
});

describe('AppStateProvider', () => {
  beforeEach(() => {
    // 각 테스트 전에 mocks 및 localStorage 초기화
    jest.clearAllMocks();
    localStorage.clear();
  });

  const TestComponent = () => {
    const appState = useAppState();

    return (
      <div>
        <span data-testid="theme">{appState.theme}</span>
        <button data-testid="toggle-theme" onClick={appState.toggleTheme}>
          Toggle Theme
        </button>

        <span data-testid="isWebAudioEnabled">
          {appState.isWebAudioEnabled.toString()}
        </span>
        <button data-testid="toggle-web-audio" onClick={appState.toggleWebAudio}>
          Toggle Web Audio
        </button>

        <span data-testid="enableSimulcast">
          {appState.enableSimulcast.toString()}
        </span>
        <button data-testid="toggle-simulcast" onClick={appState.toggleSimulcast}>
          Toggle Simulcast
        </button>

        <span data-testid="priorityBasedPolicy">
          {appState.priorityBasedPolicy ? 'enabled' : 'disabled'}
        </span>
        <button
          data-testid="toggle-priority-based-policy"
          onClick={appState.togglePriorityBasedPolicy}
        >
          Toggle Priority Based Policy
        </button>

        <span data-testid="videoTransformCpuUtilization">
          {appState.videoTransformCpuUtilization}
        </span>
        <button
          data-testid="set-cpu-utilization"
          onClick={() =>
            appState.setCpuUtilization(VideoFiltersCpuUtilization.CPU20Percent)
          }
        >
          Set CPU Utilization
        </button>

        {/* 다른 상태와 함수에 대한 요소와 버튼 추가 */}
      </div>
    );
  };

  test('기본 컨텍스트 값을 제공해야 합니다', () => {
    const { getByTestId } = render(
      <AppStateProvider>
        <TestComponent />
      </AppStateProvider>
    );

    expect(getByTestId('theme').textContent).toBe('light');
    expect(getByTestId('isWebAudioEnabled').textContent).toBe('true');
    expect(getByTestId('enableSimulcast').textContent).toBe('false');
    expect(getByTestId('priorityBasedPolicy').textContent).toBe('disabled');
    expect(getByTestId('videoTransformCpuUtilization').textContent).toBe(
      VideoFiltersCpuUtilization.CPU40Percent
    );
  });

  test('테마를 토글해야 합니다', () => {
    const { getByTestId } = render(
      <AppStateProvider>
        <TestComponent />
      </AppStateProvider>
    );

    const themeText = getByTestId('theme');
    const toggleButton = getByTestId('toggle-theme');

    expect(themeText.textContent).toBe('light');

    fireEvent.click(toggleButton);

    expect(themeText.textContent).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');

    fireEvent.click(toggleButton);

    expect(themeText.textContent).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  test('웹 오디오를 토글해야 합니다', () => {
    const { getByTestId } = render(
      <AppStateProvider>
        <TestComponent />
      </AppStateProvider>
    );

    const webAudioText = getByTestId('isWebAudioEnabled');
    const toggleButton = getByTestId('toggle-web-audio');

    expect(webAudioText.textContent).toBe('true');

    fireEvent.click(toggleButton);

    expect(webAudioText.textContent).toBe('false');

    fireEvent.click(toggleButton);

    expect(webAudioText.textContent).toBe('true');
  });

  test('시뮬캐스트를 토글해야 합니다', () => {
    const { getByTestId } = render(
      <AppStateProvider>
        <TestComponent />
      </AppStateProvider>
    );

    const simulcastText = getByTestId('enableSimulcast');
    const toggleButton = getByTestId('toggle-simulcast');

    expect(simulcastText.textContent).toBe('false');

    fireEvent.click(toggleButton);

    expect(simulcastText.textContent).toBe('true');

    fireEvent.click(toggleButton);

    expect(simulcastText.textContent).toBe('false');
  });

  test('우선순위 기반 정책을 토글해야 합니다', () => {
    const { getByTestId } = render(
      <AppStateProvider>
        <TestComponent />
      </AppStateProvider>
    );

    const policyText = getByTestId('priorityBasedPolicy');
    const toggleButton = getByTestId('toggle-priority-based-policy');

    expect(policyText.textContent).toBe('disabled');

    fireEvent.click(toggleButton);

    expect(policyText.textContent).toBe('enabled');

    fireEvent.click(toggleButton);

    expect(policyText.textContent).toBe('disabled');
  });

  test('CPU 이용률을 설정해야 합니다', () => {
    const { getByTestId } = render(
      <AppStateProvider>
        <TestComponent />
      </AppStateProvider>
    );

    const cpuUtilizationText = getByTestId('videoTransformCpuUtilization');
    const setButton = getByTestId('set-cpu-utilization');

    expect(cpuUtilizationText.textContent).toBe(
      VideoFiltersCpuUtilization.CPU40Percent
    );

    fireEvent.click(setButton);

    expect(cpuUtilizationText.textContent).toBe(
      VideoFiltersCpuUtilization.CPU20Percent
    );
  });

  test('배경 교체 옵션 변경 시 이미지 블롭을 로드해야 합니다', async () => {
    const mockedCreateBlob = createBlob as jest.MockedFunction<typeof createBlob>;
    const testBlob = new Blob(['test'], { type: 'image/png' });
    mockedCreateBlob.mockResolvedValue(testBlob);

    const TestComponent = () => {
      const appState = useAppState();

      return (
        <div>
          <span data-testid="imageBlob">
            {appState.imageBlob ? 'loaded' : 'empty'}
          </span>
          <button
            data-testid="set-background-option"
            onClick={() =>
              appState.setBackgroundReplacementOption(ReplacementOptions.Beach)
            }
          >
            Set Background Option
          </button>
        </div>
      );
    };

    const { getByTestId } = render(
      <AppStateProvider>
        <TestComponent />
      </AppStateProvider>
    );

    expect(getByTestId('imageBlob').textContent).toBe('empty');

    fireEvent.click(getByTestId('set-background-option'));

    await waitFor(() => {
      expect(getByTestId('imageBlob').textContent).toBe('loaded');
    });

    expect(createBlob).toHaveBeenCalled();
  });
});
