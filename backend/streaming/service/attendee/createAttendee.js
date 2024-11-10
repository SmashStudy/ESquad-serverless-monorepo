const AWS = require("aws-sdk");
const chimeSDKMeetings = new AWS.ChimeSDKMeetings({ region: "us-east-1" });
const { uuid } = require("../utils/utils");
const { putAttendee } = require("./attendeeService");

module.exports.createAttendee = async (title, meetingInfo) => {
  const attendeeInfo = await chimeSDKMeetings
    .createAttendee({
      MeetingId: meetingInfo.Meeting.MeetingId,
      ExternalUserId: uuid(),
    })
    .promise();

  // 참석자 정보 저장
  await putAttendee(
    title,
    attendeeInfo.Attendee.AttendeeId,
    attendeeInfo.Attendee.Name
  );

  return attendeeInfo;
};
