import React from 'react';
import { render } from '@testing-library/react';
import MicrophoneDevices from '../../../../src/components/DeviceSelection/MicrophoneDevices';
import '@testing-library/jest-dom';

// 필요한 컴포넌트들을 모킹하여 렌더링 여부를 확인합니다.
jest.mock('amazon-chime-sdk-component-library-react', () => ({
  ...jest.requireActual('amazon-chime-sdk-component-library-react'),
  Heading: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
  MicSelection: () => <div>Mocked MicSelection</div>,
}));

jest.mock('../../../../src/components/DeviceSelection/MicrophoneDevices/MicrophoneActivityPreview', () => () => (
    <div>Mocked MicrophoneActivityPreview</div>
  ));
  

describe('MicrophoneDevices 컴포넌트', () => {
  test('Heading, MicSelection, 그리고 MicrophoneActivityPreview가 렌더링되는지 확인', () => {
    const { getByText } = render(<MicrophoneDevices />);

    // "오디오" 헤딩이 렌더링되었는지 확인
    expect(getByText('오디오')).toBeInTheDocument();

    // 모킹된 MicSelection이 렌더링되었는지 확인
    expect(getByText('Mocked MicSelection')).toBeInTheDocument();

    // 모킹된 MicrophoneActivityPreview가 렌더링되었는지 확인
    expect(getByText('Mocked MicrophoneActivityPreview')).toBeInTheDocument();
  });
});
