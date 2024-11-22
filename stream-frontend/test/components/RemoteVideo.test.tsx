import '@testing-library/jest-dom';
import React from 'react';
import { render } from '@testing-library/react';
import RemoteVideo from '../../src/components/RemoteVideo';

describe('RemoteVideo 컴포넌트', () => {
  const mockVideoRef = jest.fn();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('enabled가 true일 때 비디오가 표시된다', () => {
    render(<RemoteVideo enabled={true} videoEleRef={mockVideoRef} />);

    const videoElement = document.querySelector('video') as HTMLVideoElement;
    expect(videoElement).toBeInTheDocument();
    expect(videoElement).toBeVisible();
  });

  test('enabled가 false일 때 비디오가 숨겨진다', () => {
    render(<RemoteVideo enabled={false} videoEleRef={mockVideoRef} />);

    const videoElement = document.querySelector('video') as HTMLVideoElement;
    expect(videoElement).toBeInTheDocument();
    expect(videoElement).not.toBeVisible();
  });

  test('videoEleRef가 올바르게 호출된다', () => {
    render(<RemoteVideo enabled={true} videoEleRef={mockVideoRef} />);

    const videoElement = document.querySelector('video') as HTMLVideoElement;
    expect(mockVideoRef).toHaveBeenCalledWith(videoElement);
  });

  test('컴포넌트가 언마운트될 때 videoEleRef에 null이 전달된다', () => {
    const { unmount } = render(<RemoteVideo enabled={true} videoEleRef={mockVideoRef} />);
    unmount();
    expect(mockVideoRef).toHaveBeenCalledWith(null);
  });
});
