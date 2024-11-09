import React from "react";

import {
  Flex,
  Heading,
  PrimaryButton,
} from "amazon-chime-sdk-component-library-react";

import { useAppState } from "../../providers/AppStateProvider";
import { StyledList } from "./Styled";

const MeetingDetails = () => {
  const { meetingId, toggleTheme, theme, region } = useAppState();

  return (
    <Flex container layout="fill-space-centered">
      <Flex mb="2rem" mr={{ md: "2rem" }} px="1rem">
        <Heading level={4} tag="h1" mb={2}>
          회의 정보
        </Heading>
        <StyledList>
          <div>
            <dt>회의 ID</dt>
            <dd>{meetingId}</dd>
          </div>
          <div>
            <dt>호스트의 리전</dt>
            <dd>{region}</dd>
          </div>
        </StyledList>
        <PrimaryButton
          mt={4}
          label={theme === "light" ? "어두운 모드" : "밝은 모드"}
          onClick={toggleTheme}
        ></PrimaryButton>
      </Flex>
    </Flex>
  );
};

export default MeetingDetails;
