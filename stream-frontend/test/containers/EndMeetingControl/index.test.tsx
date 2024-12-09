import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import EndMeetingControl from "../../../src/containers/EndMeetingControl";
import { useNavigate } from "react-router-dom";
import { useLogger } from "amazon-chime-sdk-component-library-react";
import { endMeeting } from "../../../src/utils/api";
import { useAppState } from "../../../src/providers/AppStateProvider";
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

// 모듈 모킹
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
}));

jest.mock("amazon-chime-sdk-component-library-react", () => {
  const actual = jest.requireActual("amazon-chime-sdk-component-library-react");
  return {
    ...actual,
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
          React.cloneElement(child, { onClose })
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
          if (closesModal && onClose) onClose();
        }}
        data-testid={`modal-button-${label}`}
      >
        {label}
      </button>
    ),
    ModalButtonGroup: ({ primaryButtons, onClose }: any) => (
      <div>
        {React.Children.map(primaryButtons, (child: any) =>
          React.cloneElement(child, { onClose })
        )}
      </div>
    ),
    useLogger: jest.fn(),
    // useRosterState를 명시적으로 함수로 모킹 (필요하다면 다시 추가)
    useRosterState: jest.fn().mockReturnValue({ roster: {} }),
  };
});

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
    mockUseNavigate.mockReturnValue(mockNavigate);
    mockUseLogger.mockReturnValue(mockLogger as any);
    mockUseAppState.mockReturnValue({ meetingId: "test-meeting-id", localUserName: "TestUser" } as any);
    mockEndMeeting.mockResolvedValue(undefined);

    jest.clearAllMocks();
  });

  test("ControlBarButton이 렌더링되고 클릭 시 모달이 열립니다", async () => {
    render(<EndMeetingControl />);

    const leaveButton = screen.getByRole('button', { name: /leave/i });
    expect(leaveButton).toBeInTheDocument();
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();

    await userEvent.click(leaveButton);

    const modal = await screen.findByTestId('modal');
    expect(modal).toBeInTheDocument();

    const modalHeader = screen.getByRole('heading', { name: /회의 종료/i });
    expect(modalHeader).toBeInTheDocument();

    const modalDescription = screen.getByText(/회의를 종료하면 회의에 다시 참여할 수 없습니다/i);
    expect(modalDescription).toBeInTheDocument();
  });

  test("회의 종료 버튼 클릭 시 endMeeting 호출 후 window.close() 호출", async () => {
    const originalClose = window.close;
    window.close = jest.fn();

    render(<EndMeetingControl />);

    const leaveButton = screen.getByRole('button', { name: /leave/i });
    await userEvent.click(leaveButton);

    const endMeetingButton = await screen.findByTestId('modal-button-회의 종료');
    await userEvent.click(endMeetingButton);

    await waitFor(() => {
      expect(mockEndMeeting).toHaveBeenCalledWith("test-meeting-id", "0", "TestUser");
      expect(window.close).toHaveBeenCalled();
    });

    window.close = originalClose;
  });

  test("취소 버튼 클릭 시 모달이 닫히며 다른 행동 없음", async () => {
    render(<EndMeetingControl />);

    const leaveButton = screen.getByRole('button', { name: /leave/i });
    await userEvent.click(leaveButton);

    const cancelButton = await screen.findByTestId('modal-button-취소');
    await userEvent.click(cancelButton);

    await waitFor(() => {
      expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
      expect(mockEndMeeting).not.toHaveBeenCalled();
      expect(mockLogger.error).not.toHaveBeenCalled();
    });
  });

  test("endMeeting 호출 시 에러 발생 시 logger.error 호출 및 window.close() 호출", async () => {
    const originalClose = window.close;
    window.close = jest.fn();
    mockEndMeeting.mockRejectedValue(new Error("API Error"));

    render(<EndMeetingControl />);

    const leaveButton = screen.getByRole('button', { name: /leave/i });
    await userEvent.click(leaveButton);

    const endMeetingButton = await screen.findByTestId('modal-button-회의 종료');
    await userEvent.click(endMeetingButton);

    await waitFor(() => {
      expect(mockEndMeeting).toHaveBeenCalledWith("test-meeting-id", "0", "TestUser");
      expect(mockLogger.error).toHaveBeenCalledWith("Could not end meeting: Error: API Error");
      expect(window.close).toHaveBeenCalled();
    });

    window.close = originalClose;
  });
});
