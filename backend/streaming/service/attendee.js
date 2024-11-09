const { getAttendee } = require("./attendeeService");

module.exports.attendee = async (event) => {
  const response = {
    statusCode: 200,
    body: "",
  };
  const { title, attendeeId } = event.queryStringParameters;
  const attendeeInfo = {
    AttendeeId: attendeeId,
    Name: await getAttendee(title, attendeeId),
  };

  response.body = JSON.stringify(attendeeInfo, "", 2);
  return response;
};
