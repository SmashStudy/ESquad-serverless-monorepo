import React from "react";
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom'; // jest-dom 매처를 사용하기 위해 임포트
import DevicePermissionPrompt from "../../src/containers/DevicePermissionPrompt";
import {
  DeviceLabelTriggerStatus,
  useDeviceLabelTriggerStatus,
  useLogger,
} from "amazon-chime-sdk-component-library-react";

// 필요한 컴포넌트들을 모킹합니다.
jest.mock("amazon-chime-sdk-component-library-react", () => ({
  Modal: ({ children, onClose, displayClose }: { children: React.ReactNode; onClose?: () => void; displayClose: boolean }) => (
    <div data-testid="modal">
      {children}
      {displayClose && <button data-testid="close-button" onClick={onClose}>Close</button>}
    </div>
  ),
  ModalBody: ({ children }: { children: React.ReactNode }) => <div data-testid="modal-body">{children}</div>,
  ModalHeader: ({ title, displayClose }: { title: string; displayClose: boolean }) => (
    <div data-testid="modal-header">
      {title}
      {displayClose && <button data-testid="header-close-button">X</button>}
    </div>
  ),
  DeviceLabelTriggerStatus: {
    IN_PROGRESS: "IN_PROGRESS",
    // SUCCESS 및 FAILED는 실제로 존재하지 않으므로 제외합니다.
  },
  useDeviceLabelTriggerStatus: jest.fn(),
  useLogger: jest.fn(),
}));

// Card 컴포넌트를 모킹합니다.
jest.mock("../../src/components/Card", () => ({
  __esModule: true,
  default: ({ title, description }: { title: string; description: React.ReactNode }) => (
    <div data-testid="card">
      <h2>{title}</h2>
      <div>{description}</div>
    </div>
  ),
}));

describe("DevicePermissionPrompt 컴포넌트", () => {
  const mockUseDeviceLabelTriggerStatus = useDeviceLabelTriggerStatus as jest.Mock;
  const mockUseLogger = useLogger as jest.Mock;

  const mockLogger = {
    info: jest.fn(),
  };

  beforeEach(() => {
    // 각 테스트 전에 모든 모킹을 초기화합니다.
    jest.clearAllMocks();
    mockUseLogger.mockReturnValue(mockLogger);
  });

  test("권한 요청이 진행 중일 때 모달이 올바르게 렌더링되는지 확인", () => {
    // useDeviceLabelTriggerStatus 훅을 IN_PROGRESS로 모킹합니다.
    mockUseDeviceLabelTriggerStatus.mockReturnValue(DeviceLabelTriggerStatus.IN_PROGRESS);

    render(<DevicePermissionPrompt />);

    // Modal이 렌더링되는지 확인합니다.
    expect(screen.getByTestId("modal")).toBeInTheDocument();

    // ModalHeader가 올바르게 렌더링되는지 확인합니다.
    expect(screen.getByTestId("modal-header")).toHaveTextContent("Device Label Permissions check");

    // Card 컴포넌트가 올바르게 렌더링되는지 확인합니다.
    expect(screen.getByTestId("card")).toBeInTheDocument();
    expect(screen.getByText("Unable to get device labels")).toBeInTheDocument();
    expect(screen.getByText(/미디어 장치를 선택하려면 다음을 수행해야 합니다 마이크 및 카메라의 권한 확인./)).toBeInTheDocument();
    expect(screen.getByText(/팝업이 나타나면 다음을 선택합니다/)).toBeInTheDocument();
    expect(screen.getByText("허용")).toBeInTheDocument();
  });

  test("권한 요청이 진행 중이지 않을 때 모달이 렌더링되지 않는지 확인", () => {
    // useDeviceLabelTriggerStatus 훅을 IN_PROGRESS가 아닌 상태로 모킹합니다.
    // DeviceLabelTriggerStatus에 다른 상태가 없으므로 undefined를 반환합니다.
    mockUseDeviceLabelTriggerStatus.mockReturnValue(undefined);

    render(<DevicePermissionPrompt />);

    // Modal이 렌더링되지 않는지 확인합니다.
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  // 모달 닫기 버튼이 없으므로 해당 테스트를 제거했습니다.
});
