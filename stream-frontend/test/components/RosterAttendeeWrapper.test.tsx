// test/components/RosterAttendeeWrapper.test.tsx

import '@testing-library/jest-dom';
import React from 'react';
import { render, screen } from '@testing-library/react';
import RosterAttendeeWrapper from '../../src/components/RosterAttendeeWrapper';
import * as chimeSdk from 'amazon-chime-sdk-component-library-react';

// `useAttendeeStatus`와 `RosterAttendee`를 모킹합니다.
jest.mock('amazon-chime-sdk-component-library-react', () => ({
  ...jest.requireActual('amazon-chime-sdk-component-library-react'),
  useAttendeeStatus: jest.fn(),
  RosterAttendee: ({ attendeeId, menu }: any) => (
    <div data-testid="roster-attendee">
      <span>{attendeeId}</span>
      {menu && <span data-testid="menu">{menu}</span>}
    </div>
  ),
}));

// `VideoStreamMetrics`를 모킹합니다.
jest.mock('../../src/containers/VideoStreamMetrics', () => () => (
  <div data-testid="video-stream-metrics" />
));

describe('RosterAttendeeWrapper 컴포넌트', () => {
  const attendeeId = 'test-attendee-id';

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('RosterAttendee가 attendeeId와 함께 렌더링된다', () => {
    // `useAttendeeStatus`가 반환하는 값을 모킹합니다.
    (chimeSdk.useAttendeeStatus as jest.Mock).mockReturnValue({ videoEnabled: false });

    render(<RosterAttendeeWrapper attendeeId={attendeeId} />);

    // `RosterAttendee`가 올바르게 렌더링되었는지 확인합니다.
    const rosterAttendee = screen.getByTestId('roster-attendee');
    expect(rosterAttendee).toBeInTheDocument();

    // `attendeeId`가 제대로 표시되는지 확인합니다.
    expect(screen.getByText(attendeeId)).toBeInTheDocument();

    // `videoEnabled`가 false이므로 메뉴가 표시되지 않아야 합니다.
    expect(screen.queryByTestId('menu')).not.toBeInTheDocument();
  });

  test('videoEnabled가 true일 때 VideoStreamMetrics가 표시된다', () => {
    // `useAttendeeStatus`가 반환하는 값을 모킹합니다.
    (chimeSdk.useAttendeeStatus as jest.Mock).mockReturnValue({ videoEnabled: true });

    render(<RosterAttendeeWrapper attendeeId={attendeeId} />);

    // `RosterAttendee`가 올바르게 렌더링되었는지 확인합니다.
    const rosterAttendee = screen.getByTestId('roster-attendee');
    expect(rosterAttendee).toBeInTheDocument();

    // `attendeeId`가 제대로 표시되는지 확인합니다.
    expect(screen.getByText(attendeeId)).toBeInTheDocument();

    // `videoEnabled`가 true이므로 메뉴가 표시되어야 합니다.
    const menu = screen.getByTestId('menu');
    expect(menu).toBeInTheDocument();

    // `VideoStreamMetrics`가 올바르게 표시되는지 확인합니다.
    expect(screen.getByTestId('video-stream-metrics')).toBeInTheDocument();
  });

  test('videoEnabled가 false일 때 VideoStreamMetrics가 표시되지 않는다', () => {
    // `useAttendeeStatus`가 반환하는 값을 모킹합니다.
    (chimeSdk.useAttendeeStatus as jest.Mock).mockReturnValue({ videoEnabled: false });

    render(<RosterAttendeeWrapper attendeeId={attendeeId} />);

    // `RosterAttendee`가 올바르게 렌더링되었는지 확인합니다.
    const rosterAttendee = screen.getByTestId('roster-attendee');
    expect(rosterAttendee).toBeInTheDocument();

    // `attendeeId`가 제대로 표시되는지 확인합니다.
    expect(screen.getByText(attendeeId)).toBeInTheDocument();

    // `videoEnabled`가 false이므로 메뉴가 표시되지 않아야 합니다.
    expect(screen.queryByTestId('menu')).not.toBeInTheDocument();

    // `VideoStreamMetrics`가 표시되지 않는지 확인합니다.
    expect(screen.queryByTestId('video-stream-metrics')).not.toBeInTheDocument();
  });
});
