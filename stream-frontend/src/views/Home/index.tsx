import React from "react";

import MeetingFormSelector from "../../containers/MeetingFormSelector";
import { StyledLayout } from "./Styled";
import { VersionLabel } from "../../utils/VersionLabel";

const Home: React.FC = () => (
  <StyledLayout>
    <MeetingFormSelector />
    <VersionLabel />
  </StyledLayout>
);

export default Home;
