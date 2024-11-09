const AWS = require("aws-sdk");
const chimeSDKMeetings = new AWS.ChimeSDKMeetings({ region: "us-east-1" });
const { uuid } = require("./utils");
const { getMeeting, putMeeting } = require("./meetingService");

const getNotificationsConfig = () => {
  return process.env.USE_EVENT_BRIDGE === "false"
    ? { SqsQueueArn: process.env.SQS_QUEUE_ARN }
    : {};
};

module.exports.createMeetingIfNeeded = async (title, region, ns_es) => {
  let meetingInfo = await getMeeting(title);

  if (!meetingInfo) {
    const request = {
      ClientRequestToken: uuid(),
      MediaRegion: region,
      NotificationsConfiguration: getNotificationsConfig(),
      ExternalMeetingId: title.substring(0, 64),
      MeetingFeatures:
        ns_es === "true"
          ? { Audio: { EchoReduction: "AVAILABLE" } }
          : undefined,
    };
    console.info("참여하기 전에 새 미팅 만들기: " + JSON.stringify(request));
    meetingInfo = await chimeSDKMeetings.createMeeting(request).promise();
    await putMeeting(title, meetingInfo);
  }

  return meetingInfo;
};
