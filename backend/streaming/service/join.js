const { createMeetingIfNeeded, createAttendee } = require("./chimeService");
const { uuid } = require("./utils");

module.exports.join = async (event) => {
  const response = {
    statusCode: 200,
    body: "",
  };
  const {
    title,
    attendeeName,
    region = "us-east-1",
    ns_es,
  } = JSON.parse(event.body);

  if (!title || !attendeeName) {
    response.statusCode = 400;
    response.body = "제목과 이름을 제공해야 합니다";
    return response;
  }

  let meetingInfo = await createMeetingIfNeeded(title, region, ns_es);

  console.info("Adding new attendee");
  const attendeeInfo = await createAttendee(title, meetingInfo);
  const joinInfo = {
    JoinInfo: {
      Title: title,
      Meeting: meetingInfo.Meeting,
      Attendee: attendeeInfo.Attendee,
    },
  };

  response.body = JSON.stringify(joinInfo, "", 2);
  return response;
};
