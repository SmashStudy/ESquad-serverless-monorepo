const { getMeeting } = require("./meetingService");
const AWS = require("aws-sdk");
const chimeSDKMeetings = new AWS.ChimeSDKMeetings({ region: "us-east-1" });

module.exports.end = async (event) => {
  const response = {
    statusCode: 200,
  };
  const { title } = JSON.parse(event.body);
  const meetingInfo = await getMeeting(title);

  await chimeSDKMeetings
    .deleteMeeting({
      MeetingId: meetingInfo.Meeting.MeetingId,
    })
    .promise();

  return response;
};
