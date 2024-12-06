import React from "react";

import {
  Flex,
  Heading,
  PrimaryButton,
  useRosterState,
} from "amazon-chime-sdk-component-library-react";

import { useAppState } from "../../providers/AppStateProvider";
import { StyledList } from "./Styled";
import { AVAILABLE_AWS_REGIONS } from "../../constants/index";

const MeetingDetails = () => {
  const { meetingId, toggleTheme, theme, region } = useAppState();
  const { roster } = useRosterState();

  let attendees = Object.values(roster);

  // region을 keyof typeof AVAILABLE_AWS_REGIONS로 지정
  const hostResion =
    AVAILABLE_AWS_REGIONS[region as keyof typeof AVAILABLE_AWS_REGIONS] ||
    "알 수 없는 지역";

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
            <dt>호스트의 지역</dt>
            <dd>{hostResion}</dd> {/* 호스트 지역 한국어로 맵핑 - 가까운 리전 */}
          </div>
          <div>
            <dt>참여자 수</dt>
            <dd>{attendees.length}</dd>
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
