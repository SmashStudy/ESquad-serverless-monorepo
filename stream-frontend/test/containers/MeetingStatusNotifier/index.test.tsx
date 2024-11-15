import "@testing-library/jest-dom";
import React from "react";
import { render, act } from "@testing-library/react"; // react에서 act를 임포트
import MeetingStatusNotifier from "../../../src/containers/MeetingStatusNotifier";
import {
  useMeetingStatus,
  useNotificationDispatch,
  ActionType,
  Severity,
  MeetingStatus,
} from "amazon-chime-sdk-component-library-react";
import { useNavigate } from "react-router-dom";
import routes from "../../../src/constants/routes";

// 훅과 모듈 모킹
jest.mock("amazon-chime-sdk-component-library-react", () => ({
  useMeetingStatus: jest.fn(),
  useNotificationDispatch: jest.fn(),
  ActionType: {
    ADD: "ADD",
  },
  Severity: {
    INFO: "INFO",
    SUCCESS: "SUCCESS",
    WARNING: "WARNING",
    ERROR: "ERROR",
  },
  MeetingStatus: {
    Loading: "Loading",
    Succeeded: "Succeeded",
    Reconnecting: "Reconnecting",
    Failed: "Failed",
    TerminalFailure: "TerminalFailure",
  },
}));

jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
}));

jest.mock("../../../src/constants/routes", () => ({
  HOME: "/home",
}));

describe("MeetingStatusNotifier", () => {
  const mockedUseMeetingStatus = useMeetingStatus as jest.Mock;
  const mockedUseNotificationDispatch = useNotificationDispatch as jest.Mock;
  const mockedUseNavigate = useNavigate as jest.Mock;

  let dispatchMock: jest.Mock;
  let navigateMock: jest.Mock;

  beforeEach(() => {
    // dispatch와 navigate 함수를 모킹
    dispatchMock = jest.fn();
    mockedUseNotificationDispatch.mockReturnValue(dispatchMock);

    navigateMock = jest.fn();
    mockedUseNavigate.mockReturnValue(navigateMock);

    // 타이머를 모킹하여 테스트에서 제어 가능하게 함
    jest.useFakeTimers();
  });

  afterEach(() => {
    // 모든 모킹을 초기화하고 타이머를 원래대로 복구
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  // 회의 상태가 'Loading'일 때 테스트
  test("회의 상태가 'Loading'일 때 '회의 연결중...' 메시지를 디스패치한다", () => {
    // useMeetingStatus가 Loading을 반환하도록 설정
    mockedUseMeetingStatus.mockReturnValue(MeetingStatus.Loading);

    render(<MeetingStatusNotifier />);

    // dispatch가 올바른 인자로 호출되었는지 확인
    expect(dispatchMock).toHaveBeenCalledWith({
      type: ActionType.ADD,
      payload: {
        severity: Severity.INFO,
        message: "회의 연결중...",
        autoClose: true,
        replaceAll: true,
      },
    });
  });

  // 회의 상태가 'Succeeded'이고 이전 상태가 'reconnecting'일 때 테스트
  test("회의 상태가 'Succeeded'이고 이전 상태가 'reconnecting'일 때 '회의가 다시 연결됨' 메시지를 디스패치한다", () => {
    // 먼저 Reconnecting 상태로 설정
    mockedUseMeetingStatus.mockReturnValueOnce(MeetingStatus.Reconnecting);
    const { rerender } = render(<MeetingStatusNotifier />);

    // Reconnecting 상태에서 dispatch 확인
    expect(dispatchMock).toHaveBeenCalledWith({
      type: ActionType.ADD,
      payload: {
        severity: Severity.WARNING,
        message: "회의 다시 연결중...",
        autoClose: true,
        replaceAll: true,
      },
    });

    // 이제 Succeeded 상태로 변경
    mockedUseMeetingStatus.mockReturnValueOnce(MeetingStatus.Succeeded);

    act(() => {
      rerender(<MeetingStatusNotifier />);
    });

    // '회의 연결됨' 메시지가 디스패치되는지 확인
    expect(dispatchMock).toHaveBeenCalledWith({
      type: ActionType.ADD,
      payload: {
        severity: Severity.SUCCESS,
        message: "회의 연결됨",
        autoClose: true,
        replaceAll: true,
      },
    });
  });

  // 회의 상태가 'Succeeded'이고 이전 상태가 'reconnecting'이 아닐 때 테스트
  test("회의 상태가 'Succeeded'이고 이전 상태가 'reconnecting'이 아닐 때 '회의 연결됨' 메시지를 디스패치한다", () => {
    // useMeetingStatus가 Succeeded를 반환하도록 설정
    mockedUseMeetingStatus.mockReturnValue(MeetingStatus.Succeeded);

    render(<MeetingStatusNotifier />);

    // Succeeded 상태에서 '회의 연결됨' 메시지가 디스패치되는지 확인
    expect(dispatchMock).toHaveBeenCalledWith({
      type: ActionType.ADD,
      payload: {
        severity: Severity.SUCCESS,
        message: "회의 연결됨",
        autoClose: true,
        replaceAll: true,
      },
    });
  });

  // 회의 상태가 'Reconnecting'일 때 테스트
  test("회의 상태가 'Reconnecting'일 때 '회의 다시 연결중...' 메시지를 디스패치하고 인터벌을 설정한다", () => {
    // useMeetingStatus가 Reconnecting을 반환하도록 설정
    mockedUseMeetingStatus.mockReturnValue(MeetingStatus.Reconnecting);

    render(<MeetingStatusNotifier />);

    // Reconnecting 상태에서 '회의 다시 연결중...' 메시지가 디스패치되는지 확인
    expect(dispatchMock).toHaveBeenCalledWith({
      type: ActionType.ADD,
      payload: {
        severity: Severity.WARNING,
        message: "회의 다시 연결중...",
        autoClose: true,
        replaceAll: true,
      },
    });

    // 10초가 지났을 때 인터벌에서 'Meeting reconnecting...' 메시지가 디스패치되는지 확인
    act(() => {
      jest.advanceTimersByTime(10 * 1000);
    });

    expect(dispatchMock).toHaveBeenCalledWith({
      type: ActionType.ADD,
      payload: {
        severity: Severity.WARNING,
        message: "Meeting reconnecting...",
        autoClose: true,
        replaceAll: true,
      },
    });
  });

  // 회의 상태가 'Failed'일 때 테스트
  test("회의 상태가 'Failed'일 때 에러 메시지를 디스패치하고 홈으로 리디렉션한다", () => {
    // useMeetingStatus가 Failed를 반환하도록 설정
    mockedUseMeetingStatus.mockReturnValue(MeetingStatus.Failed);

    render(<MeetingStatusNotifier />);

    // Failed 상태에서 에러 메시지가 디스패치되는지 확인
    expect(dispatchMock).toHaveBeenCalledWith({
      type: ActionType.ADD,
      payload: {
        severity: Severity.ERROR,
        message: "재연결 시도 후에도 회의가 실패하여 홈으로 리디렉션되었습니다",
        autoClose: true,
        replaceAll: true,
      },
    });

    // navigate가 routes.HOME으로 호출되는지 확인
    expect(navigateMock).toHaveBeenCalledWith(routes.HOME);
  });

  // 회의 상태가 'TerminalFailure'일 때 테스트
  test("회의 상태가 'TerminalFailure'일 때 치명적인 에러 메시지를 디스패치하고 홈으로 리디렉션한다", () => {
    // useMeetingStatus가 TerminalFailure를 반환하도록 설정
    mockedUseMeetingStatus.mockReturnValue(MeetingStatus.TerminalFailure);

    render(<MeetingStatusNotifier />);

    // TerminalFailure 상태에서 치명적인 에러 메시지가 디스패치되는지 확인
    expect(dispatchMock).toHaveBeenCalledWith({
      type: ActionType.ADD,
      payload: {
        severity: Severity.ERROR,
        message: "치명적인 실패로 인해 회의가 다시 연결되지 않고 홈으로 리디렉션됩니다",
        autoClose: true,
        replaceAll: true,
      },
    });

    // navigate가 routes.HOME으로 호출되는지 확인
    expect(navigateMock).toHaveBeenCalledWith(routes.HOME);
  });

  // 'reconnecting' 상태에서 컴포넌트가 언마운트되면 인터벌이 정리되는지 테스트
  test("컴포넌트가 언마운트되면 'reconnecting' 상태에서 설정된 인터벌이 정리된다", () => {
    // window.clearInterval을 스파이(mock)로 설정
    const clearIntervalSpy = jest.spyOn(window, 'clearInterval');

    // useMeetingStatus가 Reconnecting을 반환하도록 설정
    mockedUseMeetingStatus.mockReturnValue(MeetingStatus.Reconnecting);

    // 컴포넌트를 렌더링하고 언마운트
    const { unmount } = render(<MeetingStatusNotifier />);

    // 컴포넌트가 언마운트되면 clearInterval이 호출되는지 확인
    act(() => {
      unmount();
    });

    // clearInterval이 호출되었는지 확인
    expect(clearIntervalSpy).toHaveBeenCalled();

    // 스파이 정리
    clearIntervalSpy.mockRestore();
  });
});
