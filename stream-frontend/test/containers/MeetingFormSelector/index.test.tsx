import React from "react";
import { render, screen } from "@testing-library/react";
import MeetingFormSelector from "../../../src/containers/MeetingFormSelector";
import '@testing-library/jest-dom';

// Mock MeetingForm component
jest.mock("../../../src/containers/MeetingForm", () => () => <div>Mocked MeetingForm</div>);

describe("MeetingFormSelector", () => {
  it("renders the MeetingForm component inside StyledWrapper and StyledDiv", () => {
    // Render the MeetingFormSelector component
    render(<MeetingFormSelector />);

    // Check if the mocked MeetingForm is rendered
    const meetingFormElement = screen.getByText("Mocked MeetingForm");
    expect(meetingFormElement).toBeInTheDocument();
  });
});
