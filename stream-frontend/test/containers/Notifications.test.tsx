import React from "react";
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom'; // jest-dom 매처
import Notifications from "../../src/containers/Notifications";
import { useNotificationState } from "amazon-chime-sdk-component-library-react";

// amazon-chime-sdk-component-library-react 모킹
jest.mock("amazon-chime-sdk-component-library-react", () => ({
  ...jest.requireActual("amazon-chime-sdk-component-library-react"),
  useNotificationState: jest.fn(),
  NotificationGroup: () => <div data-testid="notification-group">Notification Group</div>,
}));

describe("Notifications 컴포넌트", () => {
  const mockUseNotificationState = useNotificationState as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("알림이 없을 때 NotificationGroup이 렌더링되지 않는지 확인", () => {
    // useNotificationState를 모킹하여 알림이 없는 상태로 설정
    mockUseNotificationState.mockReturnValue({
      notifications: [],
    });

    render(<Notifications />);

    // NotificationGroup이 렌더링되지 않았는지 확인
    const notificationGroup = screen.queryByTestId("notification-group");
    expect(notificationGroup).not.toBeInTheDocument();
  });

  test("알림이 있을 때 NotificationGroup이 렌더링되는지 확인", () => {
    // useNotificationState를 모킹하여 알림이 있는 상태로 설정
    mockUseNotificationState.mockReturnValue({
      notifications: [
        { id: "1", message: "첫 번째 알림" },
        { id: "2", message: "두 번째 알림" },
      ],
    });

    render(<Notifications />);

    // NotificationGroup이 렌더링되었는지 확인
    const notificationGroup = screen.getByTestId("notification-group");
    expect(notificationGroup).toBeInTheDocument();
    expect(notificationGroup).toHaveTextContent("Notification Group");
  });
});
