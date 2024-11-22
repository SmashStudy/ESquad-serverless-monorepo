import React from "react";
import { render, screen } from "@testing-library/react";
import DynamicMeetingControls from "../../../src/containers/DynamicMeetingControls";
import { useNavigation } from "../../../src/providers/NavigationProvider";
import { 
  useUserActivityState, 
  useDeviceLabelTriggerStatus, 
  DeviceLabelTriggerStatus 
} from "amazon-chime-sdk-component-library-react";
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event'; // 권장되는 사용자 이벤트 라이브러리

// 모듈 모킹
jest.mock("../../../src/providers/NavigationProvider");
jest.mock("amazon-chime-sdk-component-library-react", () => {
  return {
    __esModule: true,
    ControlBar: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="control-bar">{children}</div>
    ),
    AudioInputControl: () => (
      <button aria-label="Audio Input">Audio Input</button>
    ),
    VideoInputControl: () => (
      <button aria-label="Video Input">Video Input</button>
    ),
    ContentShareControl: () => (
      <button aria-label="Content Share">Content Share</button>
    ),
    AudioOutputControl: () => (
      <button aria-label="Audio Output">Audio Output</button>
    ),
    ControlBarButton: ({ label, onClick }: { label: string; onClick: () => void }) => (
      <button aria-label={label} onClick={onClick}>
        {label}
      </button>
    ),
    Dots: () => <span>Dots Icon</span>,
    useUserActivityState: jest.fn(),
    useDeviceLabelTriggerStatus: jest.fn(),
    DeviceLabelTriggerStatus: {
      GRANTED: 'GRANTED',
      DENIED: 'DENIED',
    },
    DeviceLabels: {
      AudioAndVideo: 'AudioAndVideo',
    },
  };
});

// 커스텀 컴포넌트 모킹
jest.mock("../../../src/containers/EndMeetingControl", () => () => (
  <button aria-label="End Meeting">End Meeting</button>
));

jest.mock("../../../src/containers/DevicePermissionControl/DevicePermissionControl", () => ({
  __esModule: true,
  default: ({ deviceLabels }: { deviceLabels: string }) => (
    <div>
      {deviceLabels === "AudioAndVideo" && <span>Request Permissions</span>}
    </div>
  ),
}));

// Styled 컴포넌트 모킹 - 올바른 절대 경로 사용
jest.mock("../../../src/containers/DynamicMeetingControls/Styled", () => ({
  StyledControls: ({ children, active }: { children: React.ReactNode; active: boolean }) => (
    <div className={`controls ${active ? 'active' : ''}`} data-testid="controls">
      {children}
    </div>
  ),
}));

// 타입 단언: 모킹된 훅의 타입을 명시적으로 지정
const mockedUseNavigation = useNavigation as jest.MockedFunction<typeof useNavigation>;
const mockedUseUserActivityState = useUserActivityState as jest.MockedFunction<typeof useUserActivityState>;
const mockedUseDeviceLabelTriggerStatus = useDeviceLabelTriggerStatus as jest.MockedFunction<typeof useDeviceLabelTriggerStatus>;

// NavigationContextType의 실제 정의에 따라 모든 필수 속성을 포함해야 합니다.
// 아래는 예시로 몇 가지 속성을 추가한 것입니다. 실제 프로젝트에 맞게 조정하세요.
interface MockedNavigationContextType {
  toggleNavbar: () => void;
  closeRoster: () => void;
  showRoster: boolean;
  showNavbar: boolean;
  toggleRoster: () => void;
  openRoster: () => void;
  openNavbar: () => void;
  closeNavbar: () => void;
  showChat: boolean;
  toggleChat: () => void;
  // 필요한 다른 속성들도 여기에 추가
}

describe("DynamicMeetingControls 컴포넌트", () => {
  let toggleNavbar: jest.Mock;
  let closeRoster: jest.Mock;

  beforeEach(() => {
    toggleNavbar = jest.fn();
    closeRoster = jest.fn();

    // 기본 mock 설정: showRoster는 false
    mockedUseNavigation.mockReturnValue({
      toggleNavbar,
      closeRoster,
      showRoster: false,
      showNavbar: false,
      toggleRoster: jest.fn(),
      openRoster: jest.fn(),
      openNavbar: jest.fn(),
      closeNavbar: jest.fn(),
      showChat: false,
      toggleChat: jest.fn(),
      // 필요한 다른 속성들도 여기에 추가
    } as unknown as MockedNavigationContextType);

    // useUserActivityState의 모킹 반환값
    mockedUseUserActivityState.mockReturnValue({ isUserActive: true });

    // useDeviceLabelTriggerStatus의 모킹 반환값
    mockedUseDeviceLabelTriggerStatus.mockReturnValue(DeviceLabelTriggerStatus.GRANTED);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("장치 권한이 허용된 경우 모든 컨트롤바가 렌더링됩니다", () => {
    render(<DynamicMeetingControls />);

    // 장치 권한에 따라 렌더링되는 컨트롤을 확인
    expect(screen.getByLabelText(/audio input/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/video input/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/content share/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/audio output/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/end meeting/i)).toBeInTheDocument();
  });

  test("장치 권한이 거부된 경우 DevicePermissionControl이 렌더링됩니다", () => {
    mockedUseDeviceLabelTriggerStatus.mockReturnValue(DeviceLabelTriggerStatus.DENIED);
    render(<DynamicMeetingControls />);

    expect(screen.getByText(/request permissions/i)).toBeInTheDocument();
  });

  test("모바일 토글 버튼 클릭 시 네비게이션 바가 토글되고 로스터가 닫힙니다 (showRoster = true)", async () => {
    // Override the mock to set showRoster to true
    mockedUseNavigation.mockReturnValue({
      toggleNavbar,
      closeRoster,
      showRoster: true, // showRoster를 true로 설정
      showNavbar: false,
      toggleRoster: jest.fn(),
      openRoster: jest.fn(),
      openNavbar: jest.fn(),
      closeNavbar: jest.fn(),
      showChat: false,
      toggleChat: jest.fn(),
      // 필요한 다른 속성들도 여기에 추가
    } as unknown as MockedNavigationContextType);

    render(<DynamicMeetingControls />);

    const toggleButton = screen.getByRole('button', { name: /menu/i });
    await userEvent.click(toggleButton);

    expect(closeRoster).toHaveBeenCalledTimes(1);
    expect(toggleNavbar).toHaveBeenCalledTimes(1);
  });

  test("모바일 토글 버튼 클릭 시 네비게이션 바가 토글되고 로스터가 닫히지 않습니다 (showRoster = false)", async () => {
    // 기본 mock 설정에서는 showRoster는 false
    render(<DynamicMeetingControls />);

    const toggleButton = screen.getByRole('button', { name: /menu/i });
    await userEvent.click(toggleButton);

    expect(closeRoster).not.toHaveBeenCalled();
    expect(toggleNavbar).toHaveBeenCalledTimes(1);
  });

  test("사용자가 활성 상태일 때 active 스타일이 적용됩니다", () => {
    mockedUseUserActivityState.mockReturnValue({ isUserActive: true });
    render(<DynamicMeetingControls />);
    
    const controls = screen.getByTestId('controls');
    expect(controls).toHaveClass('controls active');
  });

  test("사용자가 비활성 상태일 때 active 클래스가 적용되지 않습니다", () => {
    mockedUseUserActivityState.mockReturnValue({ isUserActive: false });
    render(<DynamicMeetingControls />);
    
    const controls = screen.getByTestId('controls');
    expect(controls).toHaveClass('controls');
    expect(controls).not.toHaveClass('active');
  });
});
