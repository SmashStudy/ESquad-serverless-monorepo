import { ChimeSDKMeetings } from '@aws-sdk/client-chime-sdk-meetings';

const sqsQueueArn = process.env.SQS_QUEUE_ARN;
const provideQueueArn = process.env.USE_EVENT_BRIDGE === 'false';

export const chimeSDKMeetings = new ChimeSDKMeetings({ region: 'us-east-1' });

export const uuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
};

export const getNotificationsConfig = () => {
  return provideQueueArn ? { SqsQueueArn: sqsQueueArn } : {};
};
