import React from "react";
import { render, screen, within } from "@testing-library/react";
import '@testing-library/jest-dom'; // jest-dom 매처를 사용하기 위해 임포트
import VideoStreamMetrics from "../../../src/containers/VideoStreamMetrics";
import {
  useMediaStreamMetrics,
  useAudioVideo,
} from "amazon-chime-sdk-component-library-react";

// 필요한 컴포넌트들을 모킹합니다.
jest.mock("amazon-chime-sdk-component-library-react", () => ({
  useMediaStreamMetrics: jest.fn(),
  useAudioVideo: jest.fn(),
  PopOverHeader: ({ title }: { title: string }) => <div>{title}</div>,
}));

// MediaStatsList와 MetricItem을 모킹합니다.
jest.mock("../../../src/components/MediaStatsList/index", () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

jest.mock("../../../src/components/MediaStatsList/MetricItem", () => ({
  __esModule: true,
  default: ({ metricName, metricValues }: { metricName: string; metricValues: string[] }) => (
    <div>
      <span>{metricName}</span>
      <ul>
        {metricValues.map((value, index) => (
          <li key={index}>{value}</li>
        ))}
      </ul>
    </div>
  ),
}));

// StyledMediaMetricsWrapper을 모킹합니다.
jest.mock("../../../src/components/MediaStatsList/Styled", () => ({
  StyledMediaMetricsWrapper: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

describe("VideoStreamMetrics 컴포넌트", () => {
  const attendeeId = "attendee-123";
  
  // 공통으로 사용할 mock 데이터를 정의합니다.
  const mockStreamMetrics = {
    [attendeeId]: {
      "ssrc-1": {
        videoDownstreamBitrate: 5000, // kbps 단위로 변환될 예정
        videoDownstreamPacketLossPercent: 2.5,
        videoDownstreamFramesDecodedPerSecond: 30,
        videoDownstreamFrameHeight: 720,
        videoDownstreamFrameWidth: 1280,
        videoUpstreamBitrate: 3000,
        videoUpstreamPacketsSent: 1500,
        videoUpstreamFramesEncodedPerSecond: 25,
        videoUpstreamFrameHeight: 720,
        videoUpstreamFrameWidth: 1280,
      },
      "ssrc-2": {
        videoDownstreamBitrate: 4500,
        videoDownstreamPacketLossPercent: 1.8,
        videoDownstreamFramesDecodedPerSecond: 28,
        videoDownstreamFrameHeight: 720,
        videoDownstreamFrameWidth: 1280,
        videoUpstreamBitrate: 2800,
        videoUpstreamPacketsSent: 1400,
        videoUpstreamFramesEncodedPerSecond: 24,
        videoUpstreamFrameHeight: 720,
        videoUpstreamFrameWidth: 1280,
      },
    },
  };

  beforeEach(() => {
    // 각 테스트 전에 모든 모킹을 초기화합니다.
    jest.clearAllMocks();
  });

  test("데이터가 모두 존재할 때 컴포넌트가 올바르게 렌더링되는지 확인", () => {
    // useAudioVideo와 useMediaStreamMetrics 훅을 모킹합니다.
    (useAudioVideo as jest.Mock).mockReturnValue(true);
    (useMediaStreamMetrics as jest.Mock).mockReturnValue({
      videoStreamMetrics: mockStreamMetrics,
    });

    render(<VideoStreamMetrics attendeeId={attendeeId} />);

    // PopOverHeader가 올바르게 렌더링되는지 확인합니다.
    expect(screen.getByText("Video Statistics")).toBeInTheDocument();

    // Bit rate (kbps) MetricItems 검사
    const bitRateElements = screen.getAllByText("Bit rate (kbps)");
    expect(bitRateElements).toHaveLength(2);

    // 첫 번째 Bit rate (downstream) 검사
    const downstreamBitRate = within(bitRateElements[0].parentElement as HTMLElement);
    expect(downstreamBitRate.getByText("5")).toBeInTheDocument();
    expect(downstreamBitRate.getByText("4")).toBeInTheDocument();

    // 두 번째 Bit rate (upstream) 검사
    const upstreamBitRate = within(bitRateElements[1].parentElement as HTMLElement);
    expect(upstreamBitRate.getByText("3")).toBeInTheDocument();
    expect(upstreamBitRate.getByText("2")).toBeInTheDocument();

    // Packet Loss MetricItem 검사
    const packetLossElement = screen.getByText("Packet Loss");
    const packetLoss = within(packetLossElement.parentElement as HTMLElement);
    expect(packetLoss.getByText("2")).toBeInTheDocument();
    expect(packetLoss.getByText("1")).toBeInTheDocument();

    // Frame Rate MetricItems 검사
    const frameRateElements = screen.getAllByText("Frame Rate");
    expect(frameRateElements).toHaveLength(2);

    // 첫 번째 Frame Rate (downstream) 검사
    const downstreamFrameRate = within(frameRateElements[0].parentElement as HTMLElement);
    expect(downstreamFrameRate.getByText("30")).toBeInTheDocument();
    expect(downstreamFrameRate.getByText("28")).toBeInTheDocument();

    // 두 번째 Frame Rate (upstream) 검사
    const upstreamFrameRate = within(frameRateElements[1].parentElement as HTMLElement);
    expect(upstreamFrameRate.getByText("25")).toBeInTheDocument();
    expect(upstreamFrameRate.getByText("24")).toBeInTheDocument();

    // Frame Height MetricItems 검사
    const frameHeightElements = screen.getAllByText("Frame Height");
    expect(frameHeightElements).toHaveLength(2);
    frameHeightElements.forEach((element) => {
      const frameHeight = within(element.parentElement as HTMLElement);
      expect(frameHeight.getAllByText("720")).toHaveLength(2); // ssrc-1과 ssrc-2
    });

    // Frame Width MetricItems 검사
    const frameWidthElements = screen.getAllByText("Frame Width");
    expect(frameWidthElements).toHaveLength(2);
    frameWidthElements.forEach((element) => {
      const frameWidth = within(element.parentElement as HTMLElement);
      expect(frameWidth.getAllByText("1280")).toHaveLength(2); // ssrc-1과 ssrc-2
    });

    // Packets Sent MetricItem 검사
    const packetsSentElement = screen.getByText("Packets Sent");
    const packetsSent = within(packetsSentElement.parentElement as HTMLElement);
    expect(packetsSent.getByText("1500")).toBeInTheDocument();
    expect(packetsSent.getByText("1400")).toBeInTheDocument();
  });

  test("audioVideo가 존재하지 않을 때 컴포넌트가 렌더링되지 않는지 확인", () => {
    // useAudioVideo 훅을 false로 모킹합니다.
    (useAudioVideo as jest.Mock).mockReturnValue(false);
    (useMediaStreamMetrics as jest.Mock).mockReturnValue({
      videoStreamMetrics: mockStreamMetrics,
    });

    render(<VideoStreamMetrics attendeeId={attendeeId} />);

    // PopOverHeader가 렌더링되지 않는지 확인합니다.
    expect(screen.queryByText("Video Statistics")).not.toBeInTheDocument();
  });

  test("streamMetric이 존재하지 않을 때 컴포넌트가 렌더링되지 않는지 확인", () => {
    // useAudioVideo와 useMediaStreamMetrics 훅을 모킹합니다.
    (useAudioVideo as jest.Mock).mockReturnValue(true);
    (useMediaStreamMetrics as jest.Mock).mockReturnValue({
      videoStreamMetrics: {}, // 빈 객체로 설정
    });

    render(<VideoStreamMetrics attendeeId={attendeeId} />);

    // PopOverHeader가 렌더링되지 않는지 확인합니다.
    expect(screen.queryByText("Video Statistics")).not.toBeInTheDocument();
  });

  test("여러 ssrc가 있을 때 모든 MetricItem이 올바르게 렌더링되는지 확인", () => {
    // useAudioVideo와 useMediaStreamMetrics 훅을 모킹합니다.
    (useAudioVideo as jest.Mock).mockReturnValue(true);
    (useMediaStreamMetrics as jest.Mock).mockReturnValue({
      videoStreamMetrics: mockStreamMetrics,
    });

    render(<VideoStreamMetrics attendeeId={attendeeId} />);

    // Bit rate (kbps) MetricItems 검사
    const bitRateElements = screen.getAllByText("Bit rate (kbps)");
    expect(bitRateElements).toHaveLength(2);

    // 첫 번째 Bit rate (downstream) 검사
    const downstreamBitRate = within(bitRateElements[0].parentElement as HTMLElement);
    expect(downstreamBitRate.getByText("5")).toBeInTheDocument();
    expect(downstreamBitRate.getByText("4")).toBeInTheDocument();

    // 두 번째 Bit rate (upstream) 검사
    const upstreamBitRate = within(bitRateElements[1].parentElement as HTMLElement);
    expect(upstreamBitRate.getByText("3")).toBeInTheDocument();
    expect(upstreamBitRate.getByText("2")).toBeInTheDocument();

    // Packet Loss MetricItem 검사
    const packetLossElement = screen.getByText("Packet Loss");
    const packetLoss = within(packetLossElement.parentElement as HTMLElement);
    expect(packetLoss.getByText("2")).toBeInTheDocument();
    expect(packetLoss.getByText("1")).toBeInTheDocument();

    // Frame Rate MetricItems 검사
    const frameRateElements = screen.getAllByText("Frame Rate");
    expect(frameRateElements).toHaveLength(2);

    // 첫 번째 Frame Rate (downstream) 검사
    const downstreamFrameRate = within(frameRateElements[0].parentElement as HTMLElement);
    expect(downstreamFrameRate.getByText("30")).toBeInTheDocument();
    expect(downstreamFrameRate.getByText("28")).toBeInTheDocument();

    // 두 번째 Frame Rate (upstream) 검사
    const upstreamFrameRate = within(frameRateElements[1].parentElement as HTMLElement);
    expect(upstreamFrameRate.getByText("25")).toBeInTheDocument();
    expect(upstreamFrameRate.getByText("24")).toBeInTheDocument();
  });

  test("유효하지 않은 metric 값이 빈 문자열로 처리되는지 확인", () => {
    // useAudioVideo와 useMediaStreamMetrics 훅을 모킹합니다.
    (useAudioVideo as jest.Mock).mockReturnValue(true);
    (useMediaStreamMetrics as jest.Mock).mockReturnValue({
      videoStreamMetrics: {
        [attendeeId]: {
          "ssrc-1": {
            videoDownstreamBitrate: NaN, // 유효하지 않은 값
            videoDownstreamPacketLossPercent: 2.5,
            videoDownstreamFramesDecodedPerSecond: 30,
            videoDownstreamFrameHeight: 720,
            videoDownstreamFrameWidth: 1280,
            videoUpstreamBitrate: 3000,
            videoUpstreamPacketsSent: 1500,
            videoUpstreamFramesEncodedPerSecond: 25,
            videoUpstreamFrameHeight: 720,
            videoUpstreamFrameWidth: 1280,
          },
          "ssrc-2": {
            videoDownstreamBitrate: 4500, // 유효한 값
            videoDownstreamPacketLossPercent: 1.8,
            videoDownstreamFramesDecodedPerSecond: 28,
            videoDownstreamFrameHeight: 720,
            videoDownstreamFrameWidth: 1280,
            videoUpstreamBitrate: 2800,
            videoUpstreamPacketsSent: 1400,
            videoUpstreamFramesEncodedPerSecond: 24,
            videoUpstreamFrameHeight: 720,
            videoUpstreamFrameWidth: 1280,
          },
        },
      },
    });

    render(<VideoStreamMetrics attendeeId={attendeeId} />);

    // Bit rate (kbps) MetricItems 검사
    const bitRateElements = screen.getAllByText("Bit rate (kbps)");
    expect(bitRateElements).toHaveLength(2);

    // 첫 번째 Bit rate (downstream) 검사 - 유효하지 않은 값
    const downstreamBitRate = within(bitRateElements[0].parentElement as HTMLElement);
    const downstreamListItems = downstreamBitRate.getAllByRole("listitem");
    expect(downstreamListItems[0]).toHaveTextContent(""); // 유효하지 않은 값은 빈 문자열
    expect(downstreamListItems[1]).toHaveTextContent("4"); // 유효한 값

    // 두 번째 Bit rate (upstream) 검사 - 유효한 값
    const upstreamBitRate = within(bitRateElements[1].parentElement as HTMLElement);
    const upstreamListItems = upstreamBitRate.getAllByRole("listitem");
    expect(upstreamListItems[0]).toHaveTextContent("3");
    expect(upstreamListItems[1]).toHaveTextContent("2");
  });
});
