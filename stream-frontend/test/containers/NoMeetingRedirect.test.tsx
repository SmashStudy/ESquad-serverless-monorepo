import React from "react";
import { render } from "@testing-library/react";
import '@testing-library/jest-dom';
import NoMeetingRedirect from "../../src/containers/NoMeetingRedirect";
import { useNavigate } from "react-router-dom";
import { useMeetingManager, useNotificationDispatch, Severity, ActionType } from "amazon-chime-sdk-component-library-react";
import routes from "../../src/constants/routes";

// react-router-dom 모킹
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

// amazon-chime-sdk-component-library-react 모킹
jest.mock("amazon-chime-sdk-component-library-react", () => ({
  ...jest.requireActual("amazon-chime-sdk-component-library-react"),
  useMeetingManager: jest.fn(),
  useNotificationDispatch: jest.fn(),
  Severity: {
    INFO: "INFO",
    // 필요에 따라 다른 severity 추가 가능
  },
  ActionType: {
    ADD: "ADD",
    // 필요에 따라 다른 ActionType 추가 가능
  },
}));

describe("NoMeetingRedirect 컴포넌트", () => {
  const mockUseNavigate = useNavigate as jest.Mock;
  const mockUseMeetingManager = useMeetingManager as jest.Mock;
  const mockUseNotificationDispatch = useNotificationDispatch as jest.Mock;
  const mockDispatch = jest.fn();
  const mockNavigateFn = jest.fn();

  beforeEach(() => {
    // 모든 모킹된 함수 초기화
    jest.clearAllMocks();

    // useNavigate가 호출되었을 때 mockNavigateFn을 반환하도록 설정
    mockUseNavigate.mockReturnValue(mockNavigateFn);

    // useNotificationDispatch가 호출되었을 때 mockDispatch를 반환하도록 설정
    mockUseNotificationDispatch.mockReturnValue(mockDispatch);
  });

  test("meetingSession이 없을 때 dispatch와 navigate가 호출되고, children이 렌더링되는지 확인", () => {
    // useMeetingManager를 모킹하여 meetingSession이 없도록 설정
    mockUseMeetingManager.mockReturnValue({
      meetingSession: null,
    });

    const childrenText = "자식 컴포넌트";
    const { getByText } = render(
      <NoMeetingRedirect>
        <div>{childrenText}</div>
      </NoMeetingRedirect>
    );

    // 자식 컴포넌트가 렌더링되는지 확인
    expect(getByText(childrenText)).toBeInTheDocument();

    // dispatch가 올바른 payload로 호출되었는지 확인
    expect(mockDispatch).toHaveBeenCalledWith({
      type: ActionType.ADD,
      payload: {
        severity: Severity.INFO,
        message: "No meeting found, please enter a valid meeting Id",
        autoClose: true,
      },
    });

    // navigate가 HOME 경로로 호출되었는지 확인
    expect(mockNavigateFn).toHaveBeenCalledWith(routes.HOME);
  });

  test("meetingSession이 있을 때 dispatch와 navigate가 호출되지 않고, children이 렌더링되는지 확인", () => {
    // useMeetingManager를 모킹하여 meetingSession이 존재하도록 설정
    mockUseMeetingManager.mockReturnValue({
      meetingSession: {
        // meetingSession의 실제 구조에 맞게 속성 추가 가능
      },
    });

    const childrenText = "자식 컴포넌트";
    const { getByText } = render(
      <NoMeetingRedirect>
        <div>{childrenText}</div>
      </NoMeetingRedirect>
    );

    // 자식 컴포넌트가 렌더링되는지 확인
    expect(getByText(childrenText)).toBeInTheDocument();

    // dispatch가 호출되지 않았는지 확인
    expect(mockDispatch).not.toHaveBeenCalled();

    // navigate가 호출되지 않았는지 확인
    expect(mockNavigateFn).not.toHaveBeenCalled();
  });
});
