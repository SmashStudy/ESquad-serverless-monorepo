import React from "react";
import { render, screen } from "@testing-library/react";
import LocalMediaStreamMetrics from "../../../src/containers/LocalMediaStreamMetrics";
import { useAudioVideo, useMediaStreamMetrics, useMeetingManager } from "amazon-chime-sdk-component-library-react";
import '@testing-library/jest-dom';

// Styled 컴포넌트 모킹
jest.mock("../../../src/components/MediaStatsList/Styled", () => ({
  StyledMediaMetricsWrapper: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="media-metrics-wrapper">{children}</div>
  ),
}));

// MediaStatsList 컴포넌트 모킹
jest.mock("../../../src/components/MediaStatsList", () => ({
  MediaStatsList: ({ children }: { children: React.ReactNode }) => (
    <ul data-testid="media-stats-list">{children}</ul>
  ),
}));

// MetricItem 컴포넌트 모킹
jest.mock("../../../src/components/MediaStatsList/MetricItem", () => ({
  __esModule: true,
  default: ({ metricName, metricValues }: { metricName: string, metricValues: string[] }) => (
    <li data-testid={`metric-item-${metricName}`}>
      <span>{metricName}</span>
      <span>{metricValues.join(", ")}</span>
    </li>
  ),
}));

// amazon-chime-sdk-component-library-react 훅들과 컴포넌트 모킹
jest.mock("amazon-chime-sdk-component-library-react", () => ({
  __esModule: true,
  useAudioVideo: jest.fn(),
  useMediaStreamMetrics: jest.fn(),
  useMeetingManager: jest.fn(),
  PopOverHeader: ({ title }: { title: string }) => (
    <h2>{title}</h2>
  ),
}));

describe("LocalMediaStreamMetrics 컴포넌트", () => {
  const mockUseAudioVideo = useAudioVideo as jest.Mock;
  const mockUseMediaStreamMetrics = useMediaStreamMetrics as jest.Mock;
  const mockUseMeetingManager = useMeetingManager as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("useAudioVideo가 null을 반환하면 컴포넌트는 null을 반환합니다", () => {
    mockUseAudioVideo.mockReturnValue(null);

    const { container } = render(<LocalMediaStreamMetrics />);
    expect(container.firstChild).toBeNull();
  });

  test("오디오 통계가 활성화되면 Audio statistics 섹션이 렌더링됩니다", () => {
    mockUseAudioVideo.mockReturnValue({});
    mockUseMediaStreamMetrics.mockReturnValue({
      audioPacketsSentFractionLossPercent: 5,
      audioPacketsReceivedFractionLossPercent: 10,
      availableIncomingBandwidth: null,
      availableOutgoingBandwidth: null,
      videoStreamMetrics: {},
    });

    mockUseMeetingManager.mockReturnValue({
      meetingSession: {
        configuration: {
          credentials: {
            attendeeId: "attendee-123",
          },
        },
      },
    });

    render(<LocalMediaStreamMetrics />);

    expect(screen.getByRole("heading", { name: /audio statistics/i })).toBeInTheDocument();
    expect(screen.getByTestId("metric-item-1s Loss")).toHaveTextContent("1s Loss");
    expect(screen.getByTestId("metric-item-1s Loss")).toHaveTextContent("5, 10");
  });

  test("비디오 통계가 활성화되면 Video statistics 섹션이 렌더링됩니다", () => {
    mockUseAudioVideo.mockReturnValue({});
    mockUseMediaStreamMetrics.mockReturnValue({
      audioPacketsSentFractionLossPercent: null,
      audioPacketsReceivedFractionLossPercent: null,
      availableIncomingBandwidth: null,
      availableOutgoingBandwidth: null,
      videoStreamMetrics: {
        "attendee-123": {
          "ssrc-1": {
            videoUpstreamBitrate: 2500000, // 2.5 Mbps
            videoUpstreamPacketsSent: 3000,
            videoUpstreamFramesEncodedPerSecond: 30,
            videoUpstreamFrameHeight: 720,
            videoUpstreamFrameWidth: 1280,
          },
        },
      },
    });

    mockUseMeetingManager.mockReturnValue({
      meetingSession: {
        configuration: {
          credentials: {
            attendeeId: "attendee-123",
          },
        },
      },
    });

    render(<LocalMediaStreamMetrics />);

    expect(screen.getByRole("heading", { name: /video statistics/i })).toBeInTheDocument();
    expect(screen.getByTestId("metric-item-Bit rate (kbps)")).toHaveTextContent("Bit rate (kbps)");
    expect(screen.getByTestId("metric-item-Bit rate (kbps)")).toHaveTextContent("2500");
    expect(screen.getByTestId("metric-item-Packets Sent")).toHaveTextContent("Packets Sent");
    expect(screen.getByTestId("metric-item-Packets Sent")).toHaveTextContent("3000");
    expect(screen.getByTestId("metric-item-Frame Rate")).toHaveTextContent("Frame Rate");
    expect(screen.getByTestId("metric-item-Frame Rate")).toHaveTextContent("30");
    expect(screen.getByTestId("metric-item-Frame Height")).toHaveTextContent("Frame Height");
    expect(screen.getByTestId("metric-item-Frame Height")).toHaveTextContent("720");
    expect(screen.getByTestId("metric-item-Frame Width")).toHaveTextContent("Frame Width");
    expect(screen.getByTestId("metric-item-Frame Width")).toHaveTextContent("1280");
  });

  test("대역폭 통계가 활성화되면 Bandwidth statistics 섹션이 렌더링됩니다", () => {
    mockUseAudioVideo.mockReturnValue({});
    mockUseMediaStreamMetrics.mockReturnValue({
      audioPacketsSentFractionLossPercent: null,
      audioPacketsReceivedFractionLossPercent: null,
      availableIncomingBandwidth: 5000, // kbps 단위
      availableOutgoingBandwidth: 3000, // kbps 단위
      videoStreamMetrics: {},
    });

    mockUseMeetingManager.mockReturnValue({
      meetingSession: {
        configuration: {
          credentials: {
            attendeeId: "attendee-123",
          },
        },
      },
    });

    render(<LocalMediaStreamMetrics />);

    expect(screen.getByRole("heading", { name: /bandwidth statistics/i })).toBeInTheDocument();
    expect(screen.getByTestId("metric-item-Bandwidth (kbps)")).toHaveTextContent("Bandwidth (kbps)");
    expect(screen.getByTestId("metric-item-Bandwidth (kbps)")).toHaveTextContent("3000, 5000");
  });
});
