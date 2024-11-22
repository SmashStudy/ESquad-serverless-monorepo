import "@testing-library/jest-dom";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import Navigation from "../../../src/containers/Navigation";
import {
  useNavigation,
} from "../../../src/providers/NavigationProvider";
import {
  useAppState,
} from "../../../src/providers/AppStateProvider";
import {
  useContentShareState,
} from "amazon-chime-sdk-component-library-react";
import {
  useVideoTileGridControl,
} from "../../../src/providers/VideoTileGridProvider";

// 커스텀 훅과 모듈 모킹
jest.mock("../../../src/providers/NavigationProvider", () => ({
  useNavigation: jest.fn(),
}));

jest.mock("../../../src/providers/AppStateProvider", () => ({
  useAppState: jest.fn(),
}));

jest.mock("amazon-chime-sdk-component-library-react", () => ({
  __esModule: true, // 기본 익스포트 인식
  useContentShareState: jest.fn(),
  Attendees: () => <div data-testid="AttendeesIcon" />,
  Chat: () => <div data-testid="ChatIcon" />,
  Eye: () => <div data-testid="EyeIcon" />,
  SignalStrength: () => <div data-testid="SignalStrengthIcon" />,
  ZoomIn: () => <div data-testid="ZoomInIcon" />,
  ZoomOut: () => <div data-testid="ZoomOutIcon" />,
  Navbar: ({ children, ...props }: any) => <nav>{children}</nav>, // 불필요한 props 제거
  NavbarHeader: ({ title, onClose }: any) => (
    <div data-testid="NavbarHeader">
      <span>{title}</span>
      <button onClick={onClose} data-testid="CloseNavbarButton">Close</button>
    </div>
  ),
  NavbarItem: ({ icon, onClick, label, disabled, children }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      data-testid={`${label}Button`}
    >
      {icon}
      {label}
      {children}
    </button>
  ),
  Flex: ({ children, ...props }: any) => <div>{children}</div>, // 불필요한 props 제거
}));

jest.mock("../../../src/providers/VideoTileGridProvider", () => ({
  useVideoTileGridControl: jest.fn(),
}));

jest.mock("../../../src/components/icons/GalleryLayout", () => ({
  __esModule: true, // 기본 익스포트 인식
  default: () => <div data-testid="GalleryLayoutIcon" />,
}));

jest.mock("../../../src/components/icons/FeaturedLayout", () => ({
  __esModule: true, // 기본 익스포트 인식
  default: () => <div data-testid="FeaturedLayoutIcon" />,
}));

jest.mock("../../../src/types", () => ({
  Layout: {
    Gallery: "Gallery",
    Featured: "Featured",
  },
}));

jest.mock("../../../src/constants/routes", () => ({
  HOME: "/home",
}));

jest.mock("../../../src/containers/LocalMediaStreamMetrics", () => ({
  __esModule: true, // 기본 익스포트 인식
  LocalMediaStreamMetrics: () => <div data-testid="LocalMediaStreamMetrics" />,
}));

describe("Navigation Component", () => {
  // 모킹된 함수 타입 선언
  const mockedUseNavigation = useNavigation as jest.Mock;
  const mockedUseAppState = useAppState as jest.Mock;
  const mockedUseContentShareState = useContentShareState as jest.Mock;
  const mockedUseVideoTileGridControl = useVideoTileGridControl as jest.Mock;

  // 모킹된 함수들 초기화
  const toggleRosterMock = jest.fn();
  const closeNavbarMock = jest.fn();
  const toggleChatMock = jest.fn();

  const toggleThemeMock = jest.fn();
  const setLayoutMock = jest.fn();

  const zoomInMock = jest.fn();
  const zoomOutMock = jest.fn();

  beforeEach(() => {
    // useNavigation 훅 모킹
    mockedUseNavigation.mockReturnValue({
      toggleRoster: toggleRosterMock,
      closeNavbar: closeNavbarMock,
      toggleChat: toggleChatMock,
    });

    // useAppState 훅 모킹
    mockedUseAppState.mockReturnValue({
      theme: "light",
      toggleTheme: toggleThemeMock,
      layout: "Gallery",
      setLayout: setLayoutMock,
      priorityBasedPolicy: true,
    });

    // useContentShareState 훅 모킹
    mockedUseContentShareState.mockReturnValue({
      sharingAttendeeId: null,
    });

    // useVideoTileGridControl 훅 모킹
    mockedUseVideoTileGridControl.mockReturnValue({
      zoomIn: zoomInMock,
      zoomOut: zoomOutMock,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("renders Navbar and all NavbarItems", () => {
    render(<Navigation />);

    // NavbarHeader
    expect(screen.getByTestId("NavbarHeader")).toBeInTheDocument();
    expect(screen.getByText("Navigation")).toBeInTheDocument();
    expect(screen.getByTestId("CloseNavbarButton")).toBeInTheDocument();

    // Attendees Button
    expect(screen.getByLabelText("Attendees")).toBeInTheDocument();
    expect(screen.getByTestId("AttendeesIcon")).toBeInTheDocument();

    // Chat Button
    expect(screen.getByLabelText("Chat")).toBeInTheDocument();
    expect(screen.getByTestId("ChatIcon")).toBeInTheDocument();

    // Switch View Button
    expect(screen.getByLabelText("Switch View")).toBeInTheDocument();
    // Layout: Gallery일 때 FeaturedLayoutIcon이 렌더링되어야 함
    expect(screen.getByTestId("FeaturedLayoutIcon")).toBeInTheDocument();

    // Zoom In Button
    expect(screen.getByLabelText("Zoom In")).toBeInTheDocument();
    expect(screen.getByTestId("ZoomInIcon")).toBeInTheDocument();

    // Zoom Out Button
    expect(screen.getByLabelText("Zoom Out")).toBeInTheDocument();
    expect(screen.getByTestId("ZoomOutIcon")).toBeInTheDocument();

    // Dark/Light Mode Button
    expect(screen.getByLabelText("Dark mode")).toBeInTheDocument();
    expect(screen.getByTestId("EyeIcon")).toBeInTheDocument();

    // Media Metrics Button
    expect(screen.getByLabelText("Media metrics")).toBeInTheDocument();
    expect(screen.getByTestId("SignalStrengthIcon")).toBeInTheDocument();
    expect(screen.getByTestId("LocalMediaStreamMetrics")).toBeInTheDocument();
  });

  test("clicking Attendees button calls toggleRoster", () => {
    render(<Navigation />);

    const attendeesButton = screen.getByLabelText("Attendees");
    fireEvent.click(attendeesButton);

    expect(toggleRosterMock).toHaveBeenCalledTimes(1);
  });

  test("clicking Chat button calls toggleChat", () => {
    render(<Navigation />);

    const chatButton = screen.getByLabelText("Chat");
    fireEvent.click(chatButton);

    expect(toggleChatMock).toHaveBeenCalledTimes(1);
  });

  test("clicking Switch View button toggles layout", () => {
    render(<Navigation />);

    const switchViewButton = screen.getByLabelText("Switch View");
    fireEvent.click(switchViewButton);

    expect(setLayoutMock).toHaveBeenCalledWith("Featured");
  });

  test("Switch View button shows GalleryLayoutIcon when layout is Featured", () => {
    // 업데이트된 layout 상태로 모킹
    mockedUseAppState.mockReturnValueOnce({
      theme: "light",
      toggleTheme: toggleThemeMock,
      layout: "Featured",
      setLayout: setLayoutMock,
      priorityBasedPolicy: true,
    });

    render(<Navigation />);

    expect(screen.getByTestId("GalleryLayoutIcon")).toBeInTheDocument();
  });

  test("Zoom In and Zoom Out buttons call respective functions", () => {
    render(<Navigation />);

    const zoomInButton = screen.getByLabelText("Zoom In");
    const zoomOutButton = screen.getByLabelText("Zoom Out");

    fireEvent.click(zoomInButton);
    fireEvent.click(zoomOutButton);

    expect(zoomInMock).toHaveBeenCalledTimes(1);
    expect(zoomOutMock).toHaveBeenCalledTimes(1);
  });

  test("Zoom In button is disabled when sharingAttendeeId is present", () => {
    // sharingAttendeeId가 존재하는 상태로 모킹
    mockedUseContentShareState.mockReturnValueOnce({
      sharingAttendeeId: "attendee-123",
    });

    render(<Navigation />);

    const switchViewButton = screen.getByLabelText("Switch View");
    const zoomInButton = screen.getByLabelText("Zoom In");

    expect(switchViewButton).toBeDisabled();
    expect(zoomInButton).toBeDisabled();
  });

  test("Dark mode button toggles theme", () => {
    render(<Navigation />);

    const darkModeButton = screen.getByLabelText("Dark mode");
    fireEvent.click(darkModeButton);

    expect(toggleThemeMock).toHaveBeenCalledTimes(1);
  });

  test("Media metrics displays LocalMediaStreamMetrics component", () => {
    render(<Navigation />);

    expect(
      screen.getByTestId("LocalMediaStreamMetrics")
    ).toBeInTheDocument();
  });

  test("Zoom In and Zoom Out buttons are not rendered when layout is not Gallery", () => {
    // layout을 'Featured'로 모킹
    mockedUseAppState.mockReturnValueOnce({
      theme: "light",
      toggleTheme: toggleThemeMock,
      layout: "Featured",
      setLayout: setLayoutMock,
      priorityBasedPolicy: true,
    });

    render(<Navigation />);

    expect(screen.queryByLabelText("Zoom In")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Zoom Out")).not.toBeInTheDocument();
  });

  test("Zoom In and Zoom Out buttons are not rendered when priorityBasedPolicy is false", () => {
    // priorityBasedPolicy를 false로 모킹
    mockedUseAppState.mockReturnValueOnce({
      theme: "light",
      toggleTheme: toggleThemeMock,
      layout: "Gallery",
      setLayout: setLayoutMock,
      priorityBasedPolicy: false,
    });

    render(<Navigation />);

    expect(screen.queryByLabelText("Zoom In")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("Zoom Out")).not.toBeInTheDocument();
  });
});
