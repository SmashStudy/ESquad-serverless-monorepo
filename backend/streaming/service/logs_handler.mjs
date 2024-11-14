import { CloudWatchLogs } from '@aws-sdk/client-cloudwatch-logs';
import { ensureLogStream } from './logs.mjs';

export const handler = async (event) => {
  const response = { statusCode: 200, headers: {}, body: '', isBase64Encoded: false };
  const body = JSON.parse(event.body);

  if (!body.logs || !body.appName || !body.timestamp) {
    response.body = 'Empty Parameters Received';
    response.statusCode = 400;
    return response;
  }

  const logStreamName = `ChimeReactSDKMeeting_${body.timestamp}`;
  const cloudWatchClient = new CloudWatchLogs({ apiVersion: '2014-03-28' });
  const uploadSequence = await ensureLogStream(logStreamName);
  const logEvents = body.logs.map(log => ({
    message: `${body.appName} ${new Date(log.timestampMs).toISOString()} [${log.sequenceNumber}] [${log.logLevel}]: ${log.message}`,
    timestamp: log.timestampMs,
  }));

  await cloudWatchClient.putLogEvents({
    logGroupName: process.env.BROWSER_LOG_GROUP_NAME,
    logStreamName,
    logEvents,
    ...(uploadSequence && { sequenceToken: uploadSequence }),
  });

  return response;
};
