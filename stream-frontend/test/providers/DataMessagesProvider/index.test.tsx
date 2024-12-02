import React from 'react';
import { render, act } from '@testing-library/react';
import { DataMessagesProvider, useDataMessages } from '../../../src/providers/DataMessagesProvider';
import { useAudioVideo, useMeetingManager } from 'amazon-chime-sdk-component-library-react';
import { DataMessage } from 'amazon-chime-sdk-js';
import { TextEncoder, TextDecoder } from 'util';

// @ts-ignore
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

// amazon-chime-sdk-component-library-react 모듈 모의 설정
jest.mock('amazon-chime-sdk-component-library-react', () => ({
  useAudioVideo: jest.fn(),
  useMeetingManager: jest.fn(),
}));

// AppStateProvider 모듈 모의 설정
jest.mock('../../../src/providers/AppStateProvider', () => ({
  useAppState: jest.fn(),
}));

// 모의 함수 가져오기
import { useAppState } from '../../../src/providers/AppStateProvider';

describe('DataMessagesProvider', () => {
  const mockUseAudioVideo = useAudioVideo as jest.Mock;
  const mockUseMeetingManager = useMeetingManager as jest.Mock;
  const mockUseAppState = useAppState as jest.Mock;

  beforeEach(() => {
    // useAppState 모의 반환값 설정
    mockUseAppState.mockReturnValue({
      localUserName: 'test-user',
    });

    // useAudioVideo 모의 반환값 설정
    mockUseAudioVideo.mockReturnValue({
      realtimeSubscribeToReceiveDataMessage: jest.fn(),
      realtimeUnsubscribeFromReceiveDataMessage: jest.fn(),
      realtimeSendDataMessage: jest.fn(),
    });

    // useMeetingManager 모의 반환값 설정
    mockUseMeetingManager.mockReturnValue({
      meetingSession: {
        configuration: {
          credentials: {
            attendeeId: 'test-attendee-id',
          },
        },
      },
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Provider가 올바르게 렌더링되고 context를 제공하는지 확인합니다.', () => {
    const TestComponent = () => {
      const { sendMessage, messages } = useDataMessages();
      return (
        <div>
          <button onClick={() => sendMessage('Hello')}>Send</button>
          <div data-testid="message-count">{messages.length}</div>
        </div>
      );
    };

    const { getByTestId } = render(
      <DataMessagesProvider>
        <TestComponent />
      </DataMessagesProvider>
    );

    expect(getByTestId('message-count').textContent).toBe('0');
  });

  it('sendMessage 함수가 호출되면 메시지가 전송되는지 확인합니다.', () => {
    const mockRealtimeSendDataMessage = jest.fn();
    mockUseAudioVideo.mockReturnValue({
      realtimeSubscribeToReceiveDataMessage: jest.fn(),
      realtimeUnsubscribeFromReceiveDataMessage: jest.fn(),
      realtimeSendDataMessage: mockRealtimeSendDataMessage,
    });

    const TestComponent = () => {
      const { sendMessage } = useDataMessages();
      return <button onClick={() => sendMessage('Hello')}>Send</button>;
    };

    const { getByText } = render(
      <DataMessagesProvider>
        <TestComponent />
      </DataMessagesProvider>
    );

    act(() => {
      getByText('Send').click();
    });

    expect(mockRealtimeSendDataMessage).toHaveBeenCalledWith(
      expect.any(String),
      expect.any(Object),
      expect.any(Number)
    );
  });

  it('데이터 메시지를 수신하면 메시지가 상태에 추가되는지 확인합니다.', () => {
    let dataMessageHandler: (dataMessage: DataMessage) => void = () => {};

    const mockRealtimeSubscribeToReceiveDataMessage = jest.fn((topic, callback) => {
      dataMessageHandler = callback;
    });

    mockUseAudioVideo.mockReturnValue({
      realtimeSubscribeToReceiveDataMessage: mockRealtimeSubscribeToReceiveDataMessage,
      realtimeUnsubscribeFromReceiveDataMessage: jest.fn(),
      realtimeSendDataMessage: jest.fn(),
    });

    const TestComponent = () => {
      const { messages } = useDataMessages();
      return <div data-testid="message-count">{messages.length}</div>;
    };

    const { getByTestId } = render(
      <DataMessagesProvider>
        <TestComponent />
      </DataMessagesProvider>
    );

    act(() => {
      const dataMessage = new DataMessage(
        Date.now(),
        'chat',
        new TextEncoder().encode(JSON.stringify({ message: 'Hello', senderName: 'User' })),
        'another-attendee-id',
        'User',
        false // 여섯 번째 인자까지 전달
      );

      dataMessageHandler(dataMessage);
    });

    expect(getByTestId('message-count').textContent).toBe('1');
  });

  it('컴포넌트가 언마운트될 때 구독이 해제되는지 확인합니다.', () => {
    const mockRealtimeUnsubscribeFromReceiveDataMessage = jest.fn();
    const mockRealtimeSubscribeToReceiveDataMessage = jest.fn();

    mockUseAudioVideo.mockReturnValue({
      realtimeSubscribeToReceiveDataMessage: mockRealtimeSubscribeToReceiveDataMessage,
      realtimeUnsubscribeFromReceiveDataMessage: mockRealtimeUnsubscribeFromReceiveDataMessage,
      realtimeSendDataMessage: jest.fn(),
    });

    const { unmount } = render(
      <DataMessagesProvider>
        <div>Test</div>
      </DataMessagesProvider>
    );

    unmount();

    expect(mockRealtimeUnsubscribeFromReceiveDataMessage).toHaveBeenCalled();
  });
});
