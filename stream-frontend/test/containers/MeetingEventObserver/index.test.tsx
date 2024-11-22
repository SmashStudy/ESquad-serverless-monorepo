import React from 'react';
import { render } from '@testing-library/react';
import MeetingEventObserver from '../../../src/containers/MeetingEventObserver';
import { useLogger, useMeetingEvent } from 'amazon-chime-sdk-component-library-react';
import '@testing-library/jest-dom';

// amazon-chime-sdk-component-library-react 훅 모킹
jest.mock('amazon-chime-sdk-component-library-react', () => ({
  useLogger: jest.fn(),
  useMeetingEvent: jest.fn(),
}));

describe('MeetingEventObserver 컴포넌트', () => {
  const mockInfo = jest.fn();
  const mockUseLogger = useLogger as jest.Mock;
  const mockUseMeetingEvent = useMeetingEvent as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    // useLogger가 반환하는 객체를 모킹
    mockUseLogger.mockReturnValue({
      info: mockInfo,
    });
  });

  test('회의 이벤트가 없을 때 logger.info가 호출되지 않습니다.', () => {
    // useMeetingEvent가 null을 반환하도록 설정
    mockUseMeetingEvent.mockReturnValue(null);

    render(<MeetingEventObserver />);

    // logger.info가 호출되지 않았는지 확인
    expect(mockInfo).not.toHaveBeenCalled();
  });

  test('회의 이벤트가 있을 때 logger.info가 올바르게 호출됩니다.', () => {
    const meetingEvent = {
      type: 'TEST_EVENT',
      payload: { data: 'test data' },
    };
    // useMeetingEvent가 이벤트 객체를 반환하도록 설정
    mockUseMeetingEvent.mockReturnValue(meetingEvent);

    render(<MeetingEventObserver />);

    // logger.info가 올바른 메시지와 함께 호출되었는지 확인
    expect(mockInfo).toHaveBeenCalledWith(
      `Received meeting event in MeetingEventObserver: ${JSON.stringify(meetingEvent)}`
    );
  });
});
