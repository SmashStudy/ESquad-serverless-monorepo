import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom'; // jest-dom 매처를 사용하기 위해 임포트
import useToggle from "../../src/hooks/useToggle"; // 커스텀 훅 가져오기

// 테스트를 위한 컴포넌트 생성
const TestComponent: React.FC<{ initialState: boolean }> = ({ initialState }) => {
  const { isActive, toggle } = useToggle(initialState);
  return (
    <div>
      <span data-testid="status">{isActive ? "Active" : "Inactive"}</span>
      <button onClick={toggle} data-testid="toggle-button">Toggle</button>
    </div>
  );
};

describe("useToggle 훅", () => {
  test("초기 상태가 true로 설정되었을 때 isActive가 true인지 확인", () => {
    render(<TestComponent initialState={true} />);
    const status = screen.getByTestId("status");
    expect(status).toHaveTextContent("Active");
  });

  test("초기 상태가 false로 설정되었을 때 isActive가 false인지 확인", () => {
    render(<TestComponent initialState={false} />);
    const status = screen.getByTestId("status");
    expect(status).toHaveTextContent("Inactive");
  });

  test("toggle 함수를 호출했을 때 isActive 값이 반전되는지 확인", () => {
    render(<TestComponent initialState={false} />);
    const status = screen.getByTestId("status");
    const toggleButton = screen.getByTestId("toggle-button");

    // 초기 상태 확인
    expect(status).toHaveTextContent("Inactive");

    // 첫 번째 토글
    fireEvent.click(toggleButton);
    expect(status).toHaveTextContent("Active");

    // 두 번째 토글
    fireEvent.click(toggleButton);
    expect(status).toHaveTextContent("Inactive");
  });

  test("여러 번 toggle 함수를 호출했을 때 isActive 값이 올바르게 변하는지 확인", () => {
    render(<TestComponent initialState={true} />);
    const status = screen.getByTestId("status");
    const toggleButton = screen.getByTestId("toggle-button");

    // 초기 상태 확인
    expect(status).toHaveTextContent("Active");

    // 첫 번째 토글
    fireEvent.click(toggleButton);
    expect(status).toHaveTextContent("Inactive");

    // 두 번째 토글
    fireEvent.click(toggleButton);
    expect(status).toHaveTextContent("Active");

    // 세 번째 토글
    fireEvent.click(toggleButton);
    expect(status).toHaveTextContent("Inactive");
  });
});
