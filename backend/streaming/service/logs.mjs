import { CloudWatchLogs } from '@aws-sdk/client-cloudwatch-logs';

const logGroupName = process.env.BROWSER_LOG_GROUP_NAME;

export const ensureLogStream = async (logStreamName) => {
  const cloudWatchClient = new CloudWatchLogs({ apiVersion: '2014-03-28' });
  const describeLogStreamsParams = {
    logGroupName: logGroupName,
    logStreamNamePrefix: logStreamName,
  };
  const response = await cloudWatchClient.describeLogStreams(describeLogStreamsParams);
  const foundStream = response.logStreams.find((s) => s.logStreamName === logStreamName);
  
  if (foundStream) {
    return foundStream.uploadSequenceToken;
  }

  await cloudWatchClient.createLogStream({
    logGroupName: logGroupName,
    logStreamName: logStreamName,
  });
  
  return null;
};
