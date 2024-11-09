import React from "react";

import {
  RosterAttendee,
  useAttendeeStatus,
} from "amazon-chime-sdk-component-library-react";
import VideoStreamMetrics from "../containers/VideoStreamMetrics";

interface Props {
  /** Chime 참석자 ID */
  attendeeId: string;
}

const RosterAttendeeWrapper: React.FC<Props> = ({ attendeeId }) => {
  const { videoEnabled } = useAttendeeStatus(attendeeId);
  return (
    <RosterAttendee
      attendeeId={attendeeId}
      menu={
        videoEnabled ? <VideoStreamMetrics attendeeId={attendeeId} /> : null
      }
    />
  );
};

export default RosterAttendeeWrapper;
