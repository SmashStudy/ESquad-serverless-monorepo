import React from "react";
import { Heading } from "amazon-chime-sdk-component-library-react";
import MeetingJoinDetails from "../../containers/MeetingJoinDetails";
import { StyledLayout } from "./Styled";
import DeviceSelection from "../../components/DeviceSelection";

const DeviceSetup: React.FC = () => (
  <StyledLayout>
    <Heading tag="h1" level={3} css="align-self: flex-start">
      장치 설정
    </Heading>
    <DeviceSelection />
    <MeetingJoinDetails />
  </StyledLayout>
);

export default DeviceSetup;
