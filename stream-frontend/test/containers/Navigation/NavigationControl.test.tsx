 import "@testing-library/jest-dom";
 import React from "react";
 import { render, screen } from "@testing-library/react";
 import NavigationControl from "../../../src/containers/Navigation/NavigationControl";
 import { useNavigation } from "../../../src/providers/NavigationProvider";
 
 // 컴포넌트 모킹
 jest.mock("../../../src/providers/NavigationProvider", () => ({
   useNavigation: jest.fn(),
 }));
 
 jest.mock("../../../src/containers/Navigation", () => () => (
   <div data-testid="NavigationComponent">Navigation Component</div>
 ));
 
 jest.mock("../../../src/containers/MeetingRoster", () => () => (
   <div data-testid="MeetingRosterComponent">Meeting Roster</div>
 ));
 
 jest.mock("../../../src/containers/Chat", () => () => (
   <div data-testid="ChatComponent">Chat Component</div>
 ));
 
 jest.mock("amazon-chime-sdk-component-library-react", () => ({
   __esModule: true, // 기본 익스포트 인식
   Flex: ({ children, ...props }: any) => <div data-testid="FlexComponent">{children}</div>,
 }));
 
 describe("NavigationControl Component", () => {
   const mockedUseNavigation = useNavigation as jest.Mock;
 
   beforeEach(() => {
     mockedUseNavigation.mockClear();
   });
 
   test("renders Navigation component when showNavbar is true", () => {
     mockedUseNavigation.mockReturnValue({
       showNavbar: true,
       showRoster: false,
       showChat: false,
     });
 
     render(<NavigationControl />);
 
     expect(screen.getByTestId("NavigationComponent")).toBeInTheDocument();
     expect(screen.queryByTestId("MeetingRosterComponent")).not.toBeInTheDocument();
     expect(screen.queryByTestId("ChatComponent")).not.toBeInTheDocument();
     expect(screen.queryByTestId("FlexComponent")).not.toBeInTheDocument();
   });
 
   test("does not render Navigation component when showNavbar is false", () => {
     mockedUseNavigation.mockReturnValue({
       showNavbar: false,
       showRoster: false,
       showChat: false,
     });
 
     render(<NavigationControl />);
 
     expect(screen.queryByTestId("NavigationComponent")).not.toBeInTheDocument();
     expect(screen.queryByTestId("MeetingRosterComponent")).not.toBeInTheDocument();
     expect(screen.queryByTestId("ChatComponent")).not.toBeInTheDocument();
     expect(screen.queryByTestId("FlexComponent")).not.toBeInTheDocument();
   });
 
   test("renders MeetingRoster and Chat inside Flex when both showRoster and showChat are true", () => {
     mockedUseNavigation.mockReturnValue({
       showNavbar: false,
       showRoster: true,
       showChat: true,
     });
 
     render(<NavigationControl />);
 
     const flexComponent = screen.getByTestId("FlexComponent");
     expect(flexComponent).toBeInTheDocument();
 
     expect(screen.getByTestId("MeetingRosterComponent")).toBeInTheDocument();
     expect(screen.getByTestId("ChatComponent")).toBeInTheDocument();
   });
 
   test("renders only MeetingRoster when showRoster is true and showChat is false", () => {
     mockedUseNavigation.mockReturnValue({
       showNavbar: false,
       showRoster: true,
       showChat: false,
     });
 
     render(<NavigationControl />);
 
     expect(screen.queryByTestId("FlexComponent")).not.toBeInTheDocument();
     expect(screen.getByTestId("MeetingRosterComponent")).toBeInTheDocument();
     expect(screen.queryByTestId("ChatComponent")).not.toBeInTheDocument();
   });
 
   test("renders only Chat when showChat is true and showRoster is false", () => {
     mockedUseNavigation.mockReturnValue({
       showNavbar: false,
       showRoster: false,
       showChat: true,
     });
 
     render(<NavigationControl />);
 
     expect(screen.queryByTestId("FlexComponent")).not.toBeInTheDocument();
     expect(screen.queryByTestId("MeetingRosterComponent")).not.toBeInTheDocument();
     expect(screen.getByTestId("ChatComponent")).toBeInTheDocument();
   });
 
   test("renders nothing when showNavbar, showRoster, and showChat are all false", () => {
     mockedUseNavigation.mockReturnValue({
       showNavbar: false,
       showRoster: false,
       showChat: false,
     });
 
     render(<NavigationControl />);
 
     expect(screen.queryByTestId("NavigationComponent")).not.toBeInTheDocument();
     expect(screen.queryByTestId("MeetingRosterComponent")).not.toBeInTheDocument();
     expect(screen.queryByTestId("ChatComponent")).not.toBeInTheDocument();
     expect(screen.queryByTestId("FlexComponent")).not.toBeInTheDocument();
   });
 
   test("renders MeetingRoster and Chat without Flex when Flex is not used", () => {
     // 이 테스트는 NavigationControl 컴포넌트의 로직에 따라 Flex가 항상 사용되는지 여부를 확인할 수 있습니다.
     // 현재 로직에서는 showRoster와 showChat이 모두 true일 때만 Flex가 사용됩니다.
     // 따라서 이 테스트는 Flex가 사용되지 않는 상황을 별도로 확인할 필요가 없습니다.
     // 하지만, 예시로 Flex가 아닌 다른 래퍼로 MeetingRoster와 Chat을 렌더링하는 로직이 있다면 추가할 수 있습니다.
     // 현재 컴포넌트 로직에 맞춰 이 테스트는 필요하지 않을 수 있습니다.
   });
 });
 