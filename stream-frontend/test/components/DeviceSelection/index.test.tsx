import React from 'react';
import { render } from '@testing-library/react';
import DeviceSelection from '../../../src/components/DeviceSelection';
import '@testing-library/jest-dom';

// 각 하위 컴포넌트를 모킹하여 렌더링 여부를 확인합니다.
jest.mock('../../../src/components/DeviceSelection/MicrophoneDevices', () => () => <div>Mocked MicrophoneDevices</div>);
jest.mock('../../../src/components/DeviceSelection/SpeakerDevices', () => () => <div>Mocked SpeakerDevices</div>);
jest.mock('../../../src/components/DeviceSelection/CameraDevices', () => () => <div>Mocked CameraDevices</div>);

describe('DeviceSelection 컴포넌트', () => {
  test('각 하위 컴포넌트가 렌더링되는지 확인', () => {
    const { getByText } = render(<DeviceSelection />);

    // MicrophoneDevices가 렌더링되었는지 확인
    expect(getByText('Mocked MicrophoneDevices')).toBeInTheDocument();

    // SpeakerDevices가 렌더링되었는지 확인
    expect(getByText('Mocked SpeakerDevices')).toBeInTheDocument();

    // CameraDevices가 렌더링되었는지 확인
    expect(getByText('Mocked CameraDevices')).toBeInTheDocument();
  });
});
