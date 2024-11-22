import React from "react";
import { StyledDiv, StyledWrapper } from "./Styled";
import MeetingForm from "../MeetingForm";
const MeetingFormSelector: React.FC = () => {
  const formToShow = <MeetingForm />;

  return (
    <StyledWrapper>
      <StyledDiv>{formToShow}</StyledDiv>
    </StyledWrapper>
  );
};

export default MeetingFormSelector;
