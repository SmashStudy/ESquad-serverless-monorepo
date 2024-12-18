import React from "react";
import { render } from "@testing-library/react";
import { act } from "react-dom/test-utils";
import '@testing-library/jest-dom'; // jest-dom 매처
import useMeetingEndRedirect from "../../src/hooks/useMeetingEndRedirect";
import { useNavigate } from "react-router-dom";
import {
  useNotificationDispatch,
  Severity,
  ActionType,
  useMeetingStatus,
  useLogger,
  MeetingStatus,
} from "amazon-chime-sdk-component-library-react";
import routes from "../../src/constants/routes";

// 훅을 테스트하기 위한 테스트 컴포넌트
const TestComponent: React.FC = () => {
  useMeetingEndRedirect();
  return <div>Test Component</div>;
};

// 모킹 설정
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("amazon-chime-sdk-component-library-react", () => ({
  ...jest.requireActual("amazon-chime-sdk-component-library-react"),
  useNotificationDispatch: jest.fn(),
  useMeetingStatus: jest.fn(),
  useLogger: jest.fn(),
  Severity: {
    INFO: "INFO",
    // 필요한 다른 Severity 추가 가능
  },
  ActionType: {
    ADD: "ADD",
    // 필요한 다른 ActionType 추가 가능
  },
  MeetingStatus: {
    Ended: 4,
    Reconnecting: 7,
    Joined: 2,
    Connecting: 1,
    Disconnected: 5,
    ConnectingFailed: 6,
    // 실제 사용 가능한 다른 MeetingStatus 추가
    // 예를 들어, Reconnected: 8,
  },
}));

describe("useMeetingEndRedirect 훅", () => {
  const mockUseNavigate = useNavigate as jest.Mock;
  const mockUseNotificationDispatch = useNotificationDispatch as jest.Mock;
  const mockUseMeetingStatus = useMeetingStatus as jest.Mock;
  const mockUseLogger = useLogger as jest.Mock;

  const mockNavigate = jest.fn();
  const mockDispatch = jest.fn();
  const mockLogger = {
    info: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseNotificationDispatch.mockReturnValue(mockDispatch);
    mockUseLogger.mockReturnValue(mockLogger);
  });

  test("회의 상태가 Ended일 때, 로그를 기록하고 알림을 디스패치하며 홈으로 네비게이트하는지 확인", () => {
    // useMeetingStatus가 MeetingStatus.Ended를 반환하도록 모킹
    mockUseMeetingStatus.mockReturnValue(MeetingStatus.Ended);

    render(<TestComponent />);

    // useEffect의 실행을 기다리기 위해 act 사용
    act(() => {});

    // logger.info가 올바른 메시지로 호출되었는지 확인
    expect(mockLogger.info).toHaveBeenCalledWith("[useMeetingEndRedirect] Meeting ended");

    // dispatch가 올바른 페이로드로 호출되었는지 확인
    expect(mockDispatch).toHaveBeenCalledWith({
      type: ActionType.ADD,
      payload: {
        severity: Severity.INFO,
        message: "The meeting was ended by another attendee",
        autoClose: true,
        replaceAll: true,
      },
    });

    // navigate가 HOME 경로로 호출되었는지 확인
    expect(mockNavigate).toHaveBeenCalledWith(routes.HOME);
  });

  test("회의 상태가 Ended가 아닐 때, 로그를 기록하지 않고 알림을 디스패치하지 않으며 네비게이션하지 않는지 확인", () => {
    // useMeetingStatus가 MeetingStatus.Reconnecting을 반환하도록 모킹
    mockUseMeetingStatus.mockReturnValue(MeetingStatus.Reconnecting);

    render(<TestComponent />);

    // useEffect의 실행을 기다리기 위해 act 사용
    act(() => {});

    // logger.info가 호출되지 않았는지 확인
    expect(mockLogger.info).not.toHaveBeenCalled();

    // dispatch가 호출되지 않았는지 확인
    expect(mockDispatch).not.toHaveBeenCalled();

    // navigate가 호출되지 않았는지 확인
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
