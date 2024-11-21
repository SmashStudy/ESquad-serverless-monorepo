import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ChatInput from "../../../src/containers/Chat/ChatInput";
import { useDataMessages } from "../../../src/providers/DataMessagesProvider";

// useDataMessages 모의 설정
jest.mock("../../../src/providers/DataMessagesProvider", () => ({
  useDataMessages: jest.fn(),
}));

// Input 컴포넌트를 간단한 HTML input 요소로 모의 처리
jest.mock("amazon-chime-sdk-component-library-react", () => ({
  ...jest.requireActual("amazon-chime-sdk-component-library-react"),
  Input: (props: any) => <input {...props} />,
}));

describe("ChatInput", () => {
  beforeEach(() => {
    // 기본 mock 설정: sendMessage 함수가 정의되도록 설정
    (useDataMessages as jest.Mock).mockReturnValue({ sendMessage: jest.fn() });
  });

  test("입력 변경 시 메시지 상태가 업데이트되어야 한다", () => {
    render(<ChatInput />);

    const input = screen.getByPlaceholderText("대기 중인 메시지") as HTMLInputElement;

    // 입력 필드에 텍스트를 입력
    fireEvent.change(input, { target: { value: "Hello World" } });

    // 입력 값이 상태에 업데이트되었는지 확인
    expect(input.value).toBe("Hello World");
  });

  test("Enter 키를 누르면 sendMessage가 호출되고 입력이 초기화되어야 한다", () => {
    const mockSendMessage = jest.fn();
    (useDataMessages as jest.Mock).mockReturnValue({ sendMessage: mockSendMessage });

    render(<ChatInput />);

    const input = screen.getByPlaceholderText("대기 중인 메시지") as HTMLInputElement;

    // 입력 필드에 텍스트를 입력
    fireEvent.change(input, { target: { value: "Hello World" } });

    // Enter 키를 눌렀을 때 sendMessage 호출과 입력 초기화를 확인
    fireEvent.keyPress(input, { key: "Enter", code: "Enter", charCode: 13 });
    expect(mockSendMessage).toHaveBeenCalledWith("Hello World");
    expect(input.value).toBe("");
  });
});
