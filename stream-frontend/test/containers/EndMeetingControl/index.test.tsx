import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import EndMeetingControl from "../../../src/containers/EndMeetingControl";
import { useNavigate } from "react-router-dom";
import { useLogger } from "amazon-chime-sdk-component-library-react";
import { endMeeting } from "../../../src/utils/api";
import { useAppState } from "../../../src/providers/AppStateProvider";
import routes from "../../../src/constants/routes";
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// 모듈 모킹
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("amazon-chime-sdk-component-library-react", () => ({
  __esModule: true,
  ControlBarButton: ({ icon, onClick, label }: any) => (
    <button aria-label={label} onClick={onClick}>
      {icon}
      {label}
    </button>
  ),
  Phone: () => <span>Phone Icon</span>,
  Modal: ({ children, onClose }: any) => (
    <div data-testid="modal">
      {React.Children.map(children, (child: any) =>
        React.cloneElement(child, { onClose }) // onClose를 자식에게 전달
      )}
      <button onClick={onClose}>Close Modal</button>
    </div>
  ),
  ModalBody: ({ children }: any) => <div>{children}</div>,
  ModalHeader: ({ title }: any) => <h2>{title}</h2>,
  ModalButton: ({ onClick, label, variant, closesModal, onClose }: any) => (
    <button
      onClick={() => {
        if (onClick) onClick();
        if (closesModal && onClose) onClose(); // onClose 호출
      }}
      data-testid={`modal-button-${label}`}
    >
      {label}
    </button>
  ),
  ModalButtonGroup: ({ primaryButtons, onClose }: any) => (
    <div>
      {React.Children.map(primaryButtons, (child: any) =>
        React.cloneElement(child, { onClose }) // onClose를 각 버튼에 전달
      )}
    </div>
  ),
  useLogger: jest.fn(),
}));

jest.mock("../../../src/utils/api", () => ({
  endMeeting: jest.fn(),
}));

jest.mock("../../../src/providers/AppStateProvider", () => ({
  useAppState: jest.fn(),
}));

jest.mock("../../../src/containers/EndMeetingControl/Styled", () => ({
  StyledP: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
}));

describe("EndMeetingControl 컴포넌트", () => {
  const mockNavigate = jest.fn();
  const mockLogger = {
    error: jest.fn(),
  };
  const mockEndMeeting = endMeeting as jest.MockedFunction<typeof endMeeting>;
  const mockUseNavigate = useNavigate as jest.MockedFunction<typeof useNavigate>;
  const mockUseLogger = useLogger as jest.MockedFunction<typeof useLogger>;
  const mockUseAppState = useAppState as jest.MockedFunction<typeof useAppState>;

  beforeEach(() => {
    // 기본 모킹 설정
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseLogger.mockReturnValue(mockLogger as any);
    mockUseAppState.mockReturnValue({ meetingId: "test-meeting-id" } as any);
    mockEndMeeting.mockResolvedValue(undefined); // 성공적으로 끝남

    jest.clearAllMocks();
  });

  test("ControlBarButton이 렌더링되고 클릭 시 모달이 열립니다", async () => {
    render(<EndMeetingControl />);

    // ControlBarButton이 렌더링되는지 확인
    const leaveButton = screen.getByRole('button', { name: /leave/i });
    expect(leaveButton).toBeInTheDocument();
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();

    // 버튼 클릭하여 모달 열기
    await userEvent.click(leaveButton);

    // 모달이 렌더링되는지 기다림
    const modal = await screen.findByTestId('modal');
    expect(modal).toBeInTheDocument();

    // 모달 내 내용 확인 (구체적인 역할이나 위치을 기반으로 쿼리)
    const modalHeader = screen.getByRole('heading', { name: /end meeting/i });
    expect(modalHeader).toBeInTheDocument();

    const modalDescription = screen.getByText(/leave meeting or you can end the meeting for all/i);
    expect(modalDescription).toBeInTheDocument();
  });

  test("모달의 'End meeting for all' 버튼 클릭 시 endMeeting이 호출되고 홈으로 네비게이트합니다", async () => {
    render(<EndMeetingControl />);

    // 모달 열기
    const leaveButton = screen.getByRole('button', { name: /leave/i });
    await userEvent.click(leaveButton);

    // 'End meeting for all' 버튼 클릭
    const endAllButton = await screen.findByTestId('modal-button-End meeting for all');
    await userEvent.click(endAllButton);

    await waitFor(() => {
      expect(mockEndMeeting).toHaveBeenCalledWith("test-meeting-id");
      expect(mockNavigate).toHaveBeenCalledWith(routes.HOME);
    });
  });

  test("모달의 'Leave Meeting' 버튼 클릭 시 네비게이트합니다", async () => {
    render(<EndMeetingControl />);

    // 모달 열기
    const leaveButton = screen.getByRole('button', { name: /leave/i });
    await userEvent.click(leaveButton);

    // 'Leave Meeting' 버튼 클릭
    const leaveMeetingButton = await screen.findByTestId('modal-button-Leave Meeting');
    await userEvent.click(leaveMeetingButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(routes.HOME);
      expect(mockEndMeeting).not.toHaveBeenCalled();
    });
  });

  test("모달의 'Cancel' 버튼 클릭 시 모달이 닫힙니다", async () => {
    render(<EndMeetingControl />);

    // 모달 열기
    const leaveButton = screen.getByRole('button', { name: /leave/i });
    await userEvent.click(leaveButton);
    const modal = await screen.findByTestId('modal');
    expect(modal).toBeInTheDocument();

    // 'Cancel' 버튼 클릭
    const cancelButton = screen.getByTestId('modal-button-Cancel');
    await userEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
      expect(mockNavigate).not.toHaveBeenCalled();
      expect(mockEndMeeting).not.toHaveBeenCalled();
    });
  });

  test("endMeeting 호출 시 에러 발생 시 로그가 기록됩니다", async () => {
    // endMeeting이 실패하도록 설정
    mockEndMeeting.mockRejectedValue(new Error("API Error"));

    render(<EndMeetingControl />);

    // 모달 열기
    const leaveButton = screen.getByRole('button', { name: /leave/i });
    await userEvent.click(leaveButton);

    // 'End meeting for all' 버튼 클릭
    const endAllButton = await screen.findByTestId('modal-button-End meeting for all');
    await userEvent.click(endAllButton);

    await waitFor(() => {
      expect(mockEndMeeting).toHaveBeenCalledWith("test-meeting-id");
      expect(mockLogger.error).toHaveBeenCalledWith("Could not end meeting: Error: API Error");
      expect(mockNavigate).not.toHaveBeenCalled(); // 에러 발생 시 navigate는 호출되지 않음
    });
  });
});
