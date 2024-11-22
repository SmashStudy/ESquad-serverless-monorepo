import React from 'react';
import { render } from '@testing-library/react';
import MicrophoneActivityPreview from '../../../../src/components/DeviceSelection/MicrophoneDevices/MicrophoneActivityPreview';
import '@testing-library/jest-dom';

// Label 컴포넌트 모킹
jest.mock('amazon-chime-sdk-component-library-react', () => {
  const actual = jest.requireActual('amazon-chime-sdk-component-library-react');
  return {
    ...actual,
    Label: ({ children, ...props }: { children?: React.ReactNode; [key: string]: any }) => (
      <div {...props}>{children}</div>
    ),
  };
});

// MicrophoneActivityPreviewBar 컴포넌트 모킹
jest.mock('../../../../src/components/DeviceSelection/MicrophoneDevices/MicrophoneActivityPreviewBar', () => () => (
  <div>Mocked MicrophoneActivityPreviewBar</div>
));

describe('MicrophoneActivityPreview 컴포넌트', () => {
  test('Label과 MicrophoneActivityPreviewBar를 렌더링해야 합니다', () => {
    const { getByText } = render(<MicrophoneActivityPreview />);

    // "마이크 활동" 텍스트가 렌더링되는지 확인
    expect(getByText('마이크 활동')).toBeInTheDocument();

    // 모킹된 MicrophoneActivityPreviewBar가 렌더링되는지 확인
    expect(getByText('Mocked MicrophoneActivityPreviewBar')).toBeInTheDocument();
  });
});
