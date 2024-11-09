const AWS = require("aws-sdk");
const cloudWatchLogs = new AWS.CloudWatchLogs();

module.exports.ensureLogStream = async (logStreamName) => {
  const logGroupName = process.env.BROWSER_LOG_GROUP_NAME;
  const describeLogStreamsParams = {
    logGroupName,
    logStreamNamePrefix: logStreamName,
  };

  const response = await cloudWatchLogs
    .describeLogStreams(describeLogStreamsParams)
    .promise();
  const foundStream = response.logStreams.find(
    (s) => s.logStreamName === logStreamName
  );

  if (foundStream) {
    return foundStream.uploadSequenceToken;
  }

  const putLogEventsInput = { logGroupName, logStreamName };
  await cloudWatchLogs.createLogStream(putLogEventsInput).promise();
  return null;
};
