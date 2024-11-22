import React, { useState, ChangeEvent } from "react";
import {
  Roster,
  RosterHeader,
  RosterGroup,
  useRosterState,
  RosterAttendeeType,
} from "amazon-chime-sdk-component-library-react";

import { useNavigation } from "../providers/NavigationProvider";
import RosterAttendeeWrapper from "../components/RosterAttendeeWrapper";

const MeetingRoster = () => {
  const { roster } = useRosterState();
  const [filter, setFilter] = useState("");
  const { closeRoster } = useNavigation();

  let attendees = Object.values(roster);

  if (filter) {
    attendees = attendees.filter((attendee: RosterAttendeeType) =>
      attendee?.name?.toLowerCase().includes(filter.trim().toLowerCase())
    );
  }

  const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
    setFilter(e.target.value);
  };

  const attendeeItems = attendees.map((attendee: RosterAttendeeType) => {
    const { chimeAttendeeId } = attendee || {};
    return (
      <RosterAttendeeWrapper
        key={chimeAttendeeId}
        attendeeId={chimeAttendeeId}
      />
    );
  });

  return (
    <Roster className="roster">
      <RosterHeader
        searchValue={filter}
        onSearch={handleSearch}
        onClose={closeRoster}
        title="참여자"
        badge={attendees.length}
      />
      <RosterGroup>{attendeeItems}</RosterGroup>
    </Roster>
  );
};

export default MeetingRoster;
