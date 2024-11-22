import "@testing-library/jest-dom";
import React from "react";
import { render, screen } from "@testing-library/react";
import { act } from "react"; // 업데이트된 import
import MeetingProviderWrapper from "../../../src/containers/MeetingProviderWrapper";
import { useAppState } from "../../../src/providers/AppStateProvider";
import { useVoiceFocus } from "amazon-chime-sdk-component-library-react";
import { MemoryRouter } from "react-router-dom";

// 필요한 훅과 컴포넌트 모킹
jest.mock("../../../src/providers/AppStateProvider", () => ({
  useAppState: jest.fn(),
}));

jest.mock("amazon-chime-sdk-component-library-react", () => ({
  ...jest.requireActual("amazon-chime-sdk-component-library-react"),
  useVoiceFocus: jest.fn(),
  BackgroundBlurProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  VoiceFocusProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  BackgroundReplacementProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock("../../../src/constants/routes", () => ({
  HOME: "/home",
  DEVICE: "/device",
  MEETING: "/meeting",
}));

jest.mock("../../../src/views/Home", () => () => <div>Home Component</div>);
jest.mock("../../../src/views/DeviceSetup", () => () => (
  <div>Device Setup Component</div>
));
jest.mock("../../../src/views/Meeting", () => ({ mode }: any) => (
  <div>Meeting Component Mode: {mode}</div>
));

jest.mock("../../../src/containers/MeetingEventObserver", () => () => (
  <div>MeetingEventObserver</div>
));

jest.mock("../../../src/providers/NavigationProvider", () => ({
  NavigationProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

describe("MeetingProviderWrapper", () => {
  const mockedUseAppState = useAppState as jest.Mock;
  const mockedUseVoiceFocus = useVoiceFocus as jest.Mock;

  beforeEach(() => {
    jest.spyOn(console, "log").mockImplementation(() => {}); // console.log 출력 방지
    jest.spyOn(console, "warn").mockImplementation((message) => {
      if (
        typeof message === "string" &&
        (message.includes("React Router Future Flag Warning") ||
          message.includes("v7_relativeSplatPath"))
      ) {
        return;
      }
      console.warn(message);
    });
    mockedUseVoiceFocus.mockReturnValue({
      addVoiceFocus: jest.fn(),
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  // 'imageBlob'이 정의되지 않았을 때 'Loading Assets'을 렌더링하는지 테스트
  test("'imageBlob'이 정의되지 않았을 때 'Loading Assets'을 렌더링한다", async () => {
    mockedUseAppState.mockReturnValue({
      isWebAudioEnabled: false,
      videoTransformCpuUtilization: "Disabled",
      imageBlob: undefined,
      joinInfo: null,
      meetingMode: "someMode",
    });

    await act(async () => {
      render(<MeetingProviderWrapper />);
    });

    expect(screen.getByText("Loading Assets")).toBeInTheDocument();
  });

  // 'imageBlob'이 정의되었을 때 메인 콘텐츠를 렌더링하는지 테스트
  test("'imageBlob'이 정의되었을 때 메인 콘텐츠를 렌더링한다", async () => {
    mockedUseAppState.mockReturnValue({
      isWebAudioEnabled: false,
      videoTransformCpuUtilization: "Enabled",
      imageBlob: "someImageBlob",
      joinInfo: null,
      meetingMode: "someMode",
    });

    await act(async () => {
      render(
        <MemoryRouter
          initialEntries={["/home"]}
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true, // 수정된 부분
          }}
        >
          <MeetingProviderWrapper />
        </MemoryRouter>
      );
    });

    expect(screen.getByText("Home Component")).toBeInTheDocument();
    expect(screen.getByText("MeetingEventObserver")).toBeInTheDocument();
  });

  // 'isWebAudioEnabled'가 true일 때 VoiceFocusProvider를 렌더링하는지 테스트
  test("'isWebAudioEnabled'가 true일 때 VoiceFocusProvider를 렌더링한다", async () => {
    mockedUseAppState.mockReturnValue({
      isWebAudioEnabled: true,
      videoTransformCpuUtilization: "Enabled",
      imageBlob: "someImageBlob",
      joinInfo: {
        Meeting: {
          MeetingFeatures: {
            Audio: {
              EchoReduction: "AVAILABLE",
            },
          },
        },
      },
      meetingMode: "someMode",
    });

    await act(async () => {
      render(
        <MemoryRouter
          initialEntries={["/home"]}
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true, // 수정된 부분
          }}
        >
          <MeetingProviderWrapper />
        </MemoryRouter>
      );
    });

    expect(screen.getByText("Home Component")).toBeInTheDocument();
    expect(screen.getByText("MeetingEventObserver")).toBeInTheDocument();
  });

  // 'videoTransformCpuUtilization'이 'Disabled'가 아닐 때 비디오 필터를 사용하여 렌더링하는지 테스트
  test(
    "'videoTransformCpuUtilization'이 'Disabled'가 아닐 때 비디오 필터를 사용하여 렌더링한다",
    async () => {
      mockedUseAppState.mockReturnValue({
        isWebAudioEnabled: false,
        videoTransformCpuUtilization: "High",
        imageBlob: "someImageBlob",
        joinInfo: null,
        meetingMode: "someMode",
      });

      await act(async () => {
        render(
          <MemoryRouter
            initialEntries={["/home"]}
            future={{
              v7_startTransition: true,
              v7_relativeSplatPath: true, // 수정된 부분
            }}
          >
            <MeetingProviderWrapper />
          </MemoryRouter>
        );
      });

      expect(screen.getByText("Home Component")).toBeInTheDocument();
      expect(screen.getByText("MeetingEventObserver")).toBeInTheDocument();
    }
  );
});
