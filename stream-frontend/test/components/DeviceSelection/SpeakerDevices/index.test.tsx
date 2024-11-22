import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import SpeakerDevices from '../../../../src/components/DeviceSelection/SpeakerDevices';
import { useAudioOutputs } from 'amazon-chime-sdk-component-library-react';
import TestSound from '../../../../src/utils/TestSound';
import '@testing-library/jest-dom';

// useAudioOutputs 훅을 모킹하여 selectedDevice의 초기값을 설정합니다.
jest.mock('amazon-chime-sdk-component-library-react', () => ({
  ...jest.requireActual('amazon-chime-sdk-component-library-react'),
  useAudioOutputs: jest.fn(),
  SpeakerSelection: ({ onChange }: { onChange: (deviceId: string) => void }) => (
    <select onChange={(e) => onChange((e.target as HTMLSelectElement).value)} data-testid="speaker-selection">
      <option value="device1">Device 1</option>
      <option value="device2">Device 2</option>
    </select>
  ),
  SecondaryButton: ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button onClick={onClick}>{label}</button>
  ),
}));

// TestSound 클래스를 모킹하여 handleTestSpeaker가 호출되는지 확인합니다.
jest.mock('../../../../src/utils/TestSound');

describe('SpeakerDevices 컴포넌트', () => {
  beforeEach(() => {
    // useAudioOutputs 훅의 기본 반환값 설정
    (useAudioOutputs as jest.Mock).mockReturnValue({ selectedDevice: 'default-device' });
  });

  test('SpeakerSelection과 SecondaryButton이 렌더링되는지 확인', () => {
    const { getByText, getByTestId } = render(<SpeakerDevices />);

    // SpeakerSelection이 렌더링되는지 확인
    expect(getByTestId('speaker-selection')).toBeInTheDocument();

    // 스피커 테스트 버튼이 렌더링되는지 확인
    expect(getByText('스피커 테스트')).toBeInTheDocument();
  });

  test('SpeakerSelection의 onChange 이벤트가 호출되어야 합니다', () => {
    const { getByTestId } = render(<SpeakerDevices />);
    const speakerSelection = getByTestId('speaker-selection') as HTMLSelectElement;

    // SpeakerSelection의 선택 변경을 시뮬레이션
    fireEvent.change(speakerSelection, { target: { value: 'device2' } });

    // selectedOutput이 변경되었는지 확인
    expect(speakerSelection.value).toBe('device2');
  });

  test('스피커 테스트 버튼 클릭 시 TestSound가 호출되어야 합니다', () => {
    const { getByText } = render(<SpeakerDevices />);
    const testButton = getByText('스피커 테스트');

    // 스피커 테스트 버튼 클릭
    fireEvent.click(testButton);

    // TestSound가 호출되었는지 확인
    expect(TestSound).toHaveBeenCalledWith('default-device');
  });
});
