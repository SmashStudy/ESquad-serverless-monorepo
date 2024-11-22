import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import '@testing-library/jest-dom'; // jest-dom 매처
import MeetingRoster from "../../src/containers/MeetingRoster";
import { useRosterState, RosterAttendeeType } from "amazon-chime-sdk-component-library-react";
import { useNavigation } from "../../src/providers/NavigationProvider";

// useRosterState 모킹
jest.mock("amazon-chime-sdk-component-library-react", () => ({
  ...jest.requireActual("amazon-chime-sdk-component-library-react"),
  useRosterState: jest.fn(),
  Roster: ({ children }: { children: React.ReactNode }) => <div data-testid="roster">{children}</div>,
  RosterHeader: ({ searchValue, onSearch, onClose, title, badge }: any) => (
    <div data-testid="roster-header">
      <input
        type="text"
        value={searchValue}
        onChange={onSearch}
        placeholder="Search"
        data-testid="search-input"
      />
      <button onClick={onClose} data-testid="close-button">닫기</button>
      <h1>{title}</h1>
      <span data-testid="badge">{badge}</span>
    </div>
  ),
  RosterGroup: ({ children }: { children: React.ReactNode }) => <div data-testid="roster-group">{children}</div>,
}));

// useNavigation 모킹
jest.mock("../../src/providers/NavigationProvider", () => ({
  useNavigation: jest.fn(),
}));

// RosterAttendeeWrapper 모킹
jest.mock("../../src/components/RosterAttendeeWrapper", () => ({
  __esModule: true,
  default: ({ attendeeId }: { attendeeId: string }) => (
    <div data-testid="roster-attendee">Attendee ID: {attendeeId}</div>
  ),
}));

describe("MeetingRoster 컴포넌트", () => {
  const mockUseRosterState = useRosterState as jest.Mock;
  const mockUseNavigation = useNavigation as jest.Mock;
  const mockCloseRoster = jest.fn();

  const sampleRoster: { [key: string]: RosterAttendeeType } = {
    "attendee-1": { chimeAttendeeId: "attendee-1", name: "Alice" },
    "attendee-2": { chimeAttendeeId: "attendee-2", name: "Bob" },
    "attendee-3": { chimeAttendeeId: "attendee-3", name: "Charlie" },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseRosterState.mockReturnValue({ roster: sampleRoster });
    mockUseNavigation.mockReturnValue({ closeRoster: mockCloseRoster });
  });

  test("초기 로드 시 컴포넌트가 정상적으로 렌더링되는지 확인", () => {
    render(<MeetingRoster />);

    // RosterHeader가 제대로 렌더링되었는지 확인
    const header = screen.getByTestId("roster-header");
    expect(header).toBeInTheDocument();

    // 제목과 배지가 올바르게 표시되는지 확인
    expect(screen.getByText("참여자")).toBeInTheDocument();
    expect(screen.getByTestId("badge")).toHaveTextContent("3");

    // 검색 입력 필드가 렌더링되었는지 확인
    const searchInput = screen.getByTestId("search-input");
    expect(searchInput).toBeInTheDocument();
    expect(searchInput).toHaveValue("");

    // 닫기 버튼이 렌더링되었는지 확인
    const closeButton = screen.getByTestId("close-button");
    expect(closeButton).toBeInTheDocument();

    // RosterGroup과 참석자들이 제대로 렌더링되었는지 확인
    const rosterGroup = screen.getByTestId("roster-group");
    expect(rosterGroup).toBeInTheDocument();
    expect(screen.getAllByTestId("roster-attendee")).toHaveLength(3);
    expect(screen.getByText("Attendee ID: attendee-1")).toBeInTheDocument();
    expect(screen.getByText("Attendee ID: attendee-2")).toBeInTheDocument();
    expect(screen.getByText("Attendee ID: attendee-3")).toBeInTheDocument();
  });

  test("검색 필터가 제대로 동작하는지 확인", () => {
    render(<MeetingRoster />);

    const searchInput = screen.getByTestId("search-input");

    // 'Alice' 검색
    fireEvent.change(searchInput, { target: { value: "Alice" } });
    expect(searchInput).toHaveValue("Alice");
    expect(screen.getAllByTestId("roster-attendee")).toHaveLength(1);
    expect(screen.getByText("Attendee ID: attendee-1")).toBeInTheDocument();

    // 'Bo' 검색 (부분 일치)
    fireEvent.change(searchInput, { target: { value: "Bo" } });
    expect(searchInput).toHaveValue("Bo");
    expect(screen.getAllByTestId("roster-attendee")).toHaveLength(1);
    expect(screen.getByText("Attendee ID: attendee-2")).toBeInTheDocument();

    // 'z' 검색 (일치하는 항목 없음)
    fireEvent.change(searchInput, { target: { value: "z" } });
    expect(searchInput).toHaveValue("z");
    expect(screen.queryAllByTestId("roster-attendee")).toHaveLength(0);
  });

  test("닫기 버튼이 정상적으로 동작하는지 확인", () => {
    render(<MeetingRoster />);

    const closeButton = screen.getByTestId("close-button");
    fireEvent.click(closeButton);

    expect(mockCloseRoster).toHaveBeenCalledTimes(1);
  });

  test("참여자 목록이 제대로 렌더링되는지 확인", () => {
    render(<MeetingRoster />);

    const attendeeItems = screen.getAllByTestId("roster-attendee");
    expect(attendeeItems).toHaveLength(3);
    expect(screen.getByText("Attendee ID: attendee-1")).toBeInTheDocument();
    expect(screen.getByText("Attendee ID: attendee-2")).toBeInTheDocument();
    expect(screen.getByText("Attendee ID: attendee-3")).toBeInTheDocument();
  });

  test("로스터가 비어있을 때 올바르게 렌더링되는지 확인", () => {
    // 로스터를 빈 객체로 설정
    mockUseRosterState.mockReturnValue({ roster: {} });

    render(<MeetingRoster />);

    // 배지가 0으로 표시되는지 확인
    expect(screen.getByTestId("badge")).toHaveTextContent("0");

    // 참석자 목록이 비어있는지 확인
    expect(screen.queryAllByTestId("roster-attendee")).toHaveLength(0);
  });
});
