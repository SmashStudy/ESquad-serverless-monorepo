import React from "react";

import MeetingFormSelector from "../../containers/MeetingFormSelector";
import { StyledLayout } from "./Styled";

const Home: React.FC = () => (
  <StyledLayout>
    <MeetingFormSelector />
  </StyledLayout>
);

export default Home;
