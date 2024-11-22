import React from 'react';
import { render } from '@testing-library/react';
import MicrophoneActivityPreviewBar from '../../../../src/components/DeviceSelection/MicrophoneDevices/MicrophoneActivityPreviewBar';
import { useLocalAudioInputActivityPreview } from 'amazon-chime-sdk-component-library-react';
import '@testing-library/jest-dom';

jest.mock('amazon-chime-sdk-component-library-react', () => ({
  ...jest.requireActual('amazon-chime-sdk-component-library-react'),
  useLocalAudioInputActivityPreview: jest.fn(),
}));

jest.mock('../../../../src/components/ActivityBar', () =>
  React.forwardRef<HTMLDivElement>((props, ref) => <div ref={ref}>Mocked ActivityBar</div>)
);

describe('MicrophoneActivityPreviewBar 컴포넌트', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('ActivityBar가 렌더링되고 useLocalAudioInputActivityPreview가 호출되어야 합니다', () => {
    const { getByText } = render(<MicrophoneActivityPreviewBar />);

    expect(getByText('Mocked ActivityBar')).toBeInTheDocument();
    expect(useLocalAudioInputActivityPreview).toHaveBeenCalledWith(expect.any(Object));
  });
});
