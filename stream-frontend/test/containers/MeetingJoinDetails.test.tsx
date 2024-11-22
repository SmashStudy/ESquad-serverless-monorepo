import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom'; // jest-dom 매처
import MeetingJoinDetails from "../../src/containers/MeetingJoinDetails";
import { useNavigate } from "react-router-dom";
import { useMeetingManager } from "amazon-chime-sdk-component-library-react";
import { useAppState } from "../../src/providers/AppStateProvider";
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
  Modal: ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => (
    <div data-testid="modal">
      {children}
      <button data-testid="modal-close-button" onClick={onClose}>닫기</button>
    </div>
  ),
  ModalBody: ({ children }: { children: React.ReactNode }) => <div data-testid="modal-body">{children}</div>,
  ModalHeader: ({ title }: { title: string }) => <div data-testid="modal-header">{title}</div>,
  PrimaryButton: ({ label, onClick }: { label: string; onClick: () => void }) => (
    <button onClick={onClick}>{label}</button>
  ),
  Flex: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Label: ({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) => (
    <label style={style}>{children}</label>
  ),
}));

// Card 모킹
jest.mock("../../src/components/Card", () => ({
  __esModule: true,
  default: ({ title, description, smallText }: { title: string; description: React.ReactNode; smallText?: string }) => (
    <div data-testid="card">
      <h2>{title}</h2>
      <p>{description}</p>
      {smallText && <small>{smallText}</small>}
    </div>
  ),
}));

// useAppState 모킹
jest.mock("../../src/providers/AppStateProvider", () => ({
  useAppState: jest.fn(),
}));

describe("MeetingJoinDetails 컴포넌트", () => {
  const mockNavigate = useNavigate as jest.Mock; // mockNavigate 선언
  const mockUseMeetingManagerHook = useMeetingManager as jest.Mock;
  const mockUseAppStateHook = useAppState as jest.Mock;

  const mockMeetingManager = {
    start: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockNavigate.mockReturnValue(mockNavigate); // mockNavigate의 올바른 사용
    mockUseMeetingManagerHook.mockReturnValue(mockMeetingManager);
    mockUseAppStateHook.mockReturnValue({
      meetingId: "123456",
      localUserName: "John Doe",
    });
  });

  test("초기 로드 시 컴포넌트가 정상적으로 렌더링되는지 확인", () => {
    const { container } = render(<MeetingJoinDetails />);

    // 회의 참여 버튼 확인 (getByRole 사용)
    const button = screen.getByRole("button", { name: /회의 참여하기/i });
    expect(button).toBeInTheDocument();

    // 회의 정보 라벨 확인 (container.querySelector 사용)
    const label = container.querySelector('label');
    expect(label).toHaveTextContent("회의 참여 123456 as John Doe");
  });

  test("회의 참여 버튼 클릭 시 handleJoinMeeting이 호출되고, 성공하면 페이지 이동하는지 확인", async () => {
    mockMeetingManager.start.mockResolvedValueOnce(undefined);

    render(<MeetingJoinDetails />);

    const button = screen.getByRole("button", { name: /회의 참여하기/i });
    fireEvent.click(button);

    // 버튼 텍스트가 '로딩중...'으로 변경되는지 확인
    expect(button).toHaveTextContent("로딩중...");

    // start 함수가 호출되었는지 확인
    await waitFor(() => {
      expect(mockMeetingManager.start).toHaveBeenCalled();
    });

    // navigate 함수가 올바르게 호출되었는지 확인
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(`${routes.MEETING}/123456`);
    });

    // 버튼 텍스트가 원래대로 돌아왔는지 확인
    expect(button).toHaveTextContent("회의 참여하기");
  });

  test("회의 참여 버튼 클릭 시 handleJoinMeeting이 호출되고, 실패하면 에러 모달이 표시되는지 확인", async () => {
    mockMeetingManager.start.mockRejectedValueOnce(new Error("회의에 참여할 수 없습니다"));

    render(<MeetingJoinDetails />);

    const button = screen.getByRole("button", { name: /회의 참여하기/i });
    fireEvent.click(button);

    // 버튼 텍스트가 '로딩중...'으로 변경되는지 확인
    expect(button).toHaveTextContent("로딩중...");

    // start 함수가 호출되었는지 확인
    await waitFor(() => {
      expect(mockMeetingManager.start).toHaveBeenCalled();
    });

    // 에러 모달이 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByTestId("modal")).toBeInTheDocument();
      expect(screen.getByTestId("modal-header")).toHaveTextContent("Meeting ID: 123456");
      expect(screen.getByTestId("card")).toBeInTheDocument();
      expect(screen.getByText("Unable to join meeting")).toBeInTheDocument();
      expect(screen.getByText("There was an issue in joining this meeting. Check your connectivity and try again.")).toBeInTheDocument();
      
      // 에러 메시지가 small 태그 안에 있기 때문에, 텍스트 매처를 조정
      expect(screen.getByText(/회의에 참여할 수 없습니다/i)).toBeInTheDocument();
    });

    // 모달 닫기 버튼이 정상적으로 동작하는지 확인
    const closeButton = screen.getByTestId("modal-close-button");
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });
  });

  test("에러 모달 닫기 버튼이 에러를 제거하는지 확인", async () => {
    mockMeetingManager.start.mockRejectedValueOnce(new Error("회의에 참여할 수 없습니다"));

    render(<MeetingJoinDetails />);

    const button = screen.getByRole("button", { name: /회의 참여하기/i });
    fireEvent.click(button);

    // 에러 모달이 표시되는지 확인
    await waitFor(() => {
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });

    // 모달 닫기 버튼이 동작하는지 확인
    const closeButton = screen.getByTestId("modal-close-button");
    fireEvent.click(closeButton);

    await waitFor(() => {
      expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
    });

    // 다시 렌더링하여 모달이 사라졌는지 확인
    render(<MeetingJoinDetails />);
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });
});
