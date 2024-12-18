import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import '@testing-library/jest-dom'; // 개별 임포트 (선택 사항)
import SIPURI from "../../../src/containers/SIPURI";

// PrimaryButton 컴포넌트를 모킹합니다.
jest.mock("amazon-chime-sdk-component-library-react", () => ({
  PrimaryButton: jest.fn(({ label, onClick }) => (
    <button onClick={onClick}>{label}</button>
  )),
}));

describe("SIPURI 컴포넌트", () => {
  const sipURI = "sip:example@domain.com";

  beforeEach(() => {
    // 각 테스트 전에 모든 모킹을 초기화합니다.
    jest.clearAllMocks();
    // 기본적으로 document.queryCommandSupported를 true로 모킹합니다.
    document.queryCommandSupported = jest.fn().mockReturnValue(true);
  });

  test("SIP URI가 올바르게 렌더링되는지 확인", () => {
    render(<SIPURI sipURI={sipURI} />);
    expect(screen.getByText("SIP URI")).toBeInTheDocument();
    expect(screen.getByText(sipURI)).toBeInTheDocument();
    // Copy 버튼이 렌더링되는지 추가로 확인합니다.
    expect(screen.getByText("Copy")).toBeInTheDocument();
  });

  test("복사 기능이 지원될 때 Copy 버튼이 표시되는지 확인", () => {
    // beforeEach에서 이미 true로 모킹됨
    render(<SIPURI sipURI={sipURI} />);
    expect(screen.getByText("Copy")).toBeInTheDocument();
  });

  test("복사 기능이 지원되지 않을 때 Copy 버튼이 표시되지 않는지 확인", () => {
    // document.queryCommandSupported를 false로 모킹합니다.
    document.queryCommandSupported = jest.fn().mockReturnValue(false);

    render(<SIPURI sipURI={sipURI} />);
    expect(screen.queryByText("Copy")).not.toBeInTheDocument();
  });

  test("SIP URI를 클립보드에 복사하고 'Copied!' 레이블이 표시되는지 확인", () => {
    // document.queryCommandSupported를 true로 모킹합니다.
    document.queryCommandSupported = jest.fn().mockReturnValue(true);

    // window.getSelection과 document.execCommand를 모킹합니다.
    const mockRange = {
      selectNodeContents: jest.fn(),
    };
    const mockSelection = {
      removeAllRanges: jest.fn(),
      addRange: jest.fn(),
    };

    document.createRange = jest.fn().mockReturnValue(mockRange);
    window.getSelection = jest.fn().mockReturnValue(mockSelection as any);
    document.execCommand = jest.fn().mockReturnValue(true);

    // 타이머를 가짜로 설정하여 setTimeout을 제어합니다.
    jest.useFakeTimers();

    render(<SIPURI sipURI={sipURI} />);

    const copyButton = screen.getByText("Copy");
    expect(copyButton).toBeInTheDocument();

    // Copy 버튼을 클릭합니다.
    fireEvent.click(copyButton);

    // 복사 기능 관련 함수들이 호출되었는지 확인합니다.
    expect(document.createRange).toHaveBeenCalled();
    expect(mockRange.selectNodeContents).toHaveBeenCalled();
    expect(mockSelection.removeAllRanges).toHaveBeenCalledTimes(2); // 전과 후
    expect(mockSelection.addRange).toHaveBeenCalledWith(mockRange);
    expect(document.execCommand).toHaveBeenCalledWith("copy");

    // 'Copied!' 레이블이 표시되는지 확인합니다.
    expect(screen.getByText("Copied!")).toBeInTheDocument();

    // 타임아웃을 빠르게 진행시킵니다.
    act(() => {
      jest.advanceTimersByTime(2000);
    });

    // 다시 'Copy' 레이블이 표시되는지 확인합니다.
    expect(screen.getByText("Copy")).toBeInTheDocument();

    // 실제 타이머로 복원합니다.
    jest.useRealTimers();
  });

  test("복사 실패 시 에러를 정상적으로 처리하는지 확인", () => {
    // document.queryCommandSupported를 true로 모킹합니다.
    document.queryCommandSupported = jest.fn().mockReturnValue(true);

    // window.getSelection과 document.execCommand를 에러를 발생하도록 모킹합니다.
    const mockRange = {
      selectNodeContents: jest.fn(),
    };
    const mockSelection = {
      removeAllRanges: jest.fn(),
      addRange: jest.fn(),
    };

    document.createRange = jest.fn().mockReturnValue(mockRange);
    window.getSelection = jest.fn().mockReturnValue(mockSelection as any);
    document.execCommand = jest.fn().mockImplementation(() => {
      throw new Error("Copy failed");
    });

    // console.error를 모킹하여 에러 메시지를 캡처합니다.
    console.error = jest.fn();

    render(<SIPURI sipURI={sipURI} />);

    const copyButton = screen.getByText("Copy");
    fireEvent.click(copyButton);

    // 에러 메시지가 콘솔에 출력되었는지 확인합니다.
    expect(console.error).toHaveBeenCalledWith("Could not copy content");
    // 'Copy' 레이블이 여전히 표시되는지 확인합니다.
    expect(screen.getByText("Copy")).toBeInTheDocument();
  });

  test("window.getSelection이 없을 때 에러를 정상적으로 처리하는지 확인", () => {
    // document.queryCommandSupported를 true로 모킹합니다.
    document.queryCommandSupported = jest.fn().mockReturnValue(true);

    // window.getSelection을 null로 모킹합니다.
    window.getSelection = jest.fn().mockReturnValue(null);

    // console.error를 모킹하여 에러 메시지를 캡처합니다.
    console.error = jest.fn();

    render(<SIPURI sipURI={sipURI} />);

    const copyButton = screen.getByText("Copy");
    fireEvent.click(copyButton);

    // 에러 메시지가 콘솔에 출력되었는지 확인합니다.
    expect(console.error).toHaveBeenCalledWith(
      "Could not get window selection to copy content"
    );
    // 'Copy' 레이블이 여전히 표시되는지 확인합니다.
    expect(screen.getByText("Copy")).toBeInTheDocument();
  });
});
