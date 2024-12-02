import { CloudWatchLogs } from '@aws-sdk/client-cloudwatch-logs';
import { handler } from '../src/logHandler.mjs';
import { ensureLogStream } from '../src/logStreamManager.mjs';

jest.mock('@aws-sdk/client-cloudwatch-logs', () => ({
  CloudWatchLogs: jest.fn(),
}));

jest.mock('../src/logStreamManager.mjs', () => ({
  ensureLogStream: jest.fn(),
}));

describe('handler', () => {
  let mockCloudWatchClient;
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.BROWSER_LOG_GROUP_NAME = 'TestLogGroupName'; // 환경 변수 설정
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // CloudWatchLogs 인스턴스를 올바르게 생성하여 테스트에서 사용하도록 설정
    mockCloudWatchClient = {
      putLogEvents: jest.fn(),
    };
    CloudWatchLogs.mockImplementation(() => mockCloudWatchClient);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test('로그를 성공적으로 처리해야 합니다', async () => {
    const mockEvent = {
      body: JSON.stringify({
        logs: [
          { timestampMs: 1697990400000, sequenceNumber: '1', logLevel: 'INFO', message: 'Test log 1' },
          { timestampMs: 1697990460000, sequenceNumber: '2', logLevel: 'DEBUG', message: 'Test log 2' },
        ],
        appName: 'TestApp',
        timestamp: 1697990400,
      }),
    };

    const mockLogStreamName = 'ChimeReactSDKMeeting_1697990400';
    const mockSequenceToken = 'mockSequenceToken';

    ensureLogStream.mockResolvedValue(mockSequenceToken);
    mockCloudWatchClient.putLogEvents.mockResolvedValueOnce({});

    // ISO String 변환을 하되, UTC로 고정하여 테스트합니다.
    const formatDateToISOString = (timestampMs) => {
      return new Date(timestampMs).toISOString();  // UTC로 변환된 ISO 8601 형식
    };

    const expectedLogEvents = [
      {
        message: `TestApp ${formatDateToISOString(1697990400000)} [1] [INFO]: Test log 1`,
        timestamp: 1697990400000,
      },
      {
        message: `TestApp ${formatDateToISOString(1697990460000)} [2] [DEBUG]: Test log 2`,
        timestamp: 1697990460000,
      }
    ];

    const response = await handler(mockEvent);

    expect(response).toEqual({
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Logs processed successfully.' }),
      isBase64Encoded: false,
    });

    expect(consoleLogSpy).toHaveBeenCalledWith('Received Event:', expect.any(String));
    expect(ensureLogStream).toHaveBeenCalledWith(mockLogStreamName);
    expect(mockCloudWatchClient.putLogEvents).toHaveBeenCalledWith({
      logGroupName: process.env.BROWSER_LOG_GROUP_NAME,
      logStreamName: mockLogStreamName,
      logEvents: expectedLogEvents,
      sequenceToken: mockSequenceToken,
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('필수 파라미터가 누락된 경우 400 상태 코드를 반환해야 합니다', async () => {
    const mockEvent = {
      body: JSON.stringify({
        logs: [],
        timestamp: 1697990400,
      }),
    };

    const response = await handler(mockEvent);

    expect(response).toEqual({
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Empty Parameters Received' }),
      isBase64Encoded: false,
    });

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('이벤트 본문이 없는 경우 500 상태 코드를 반환해야 합니다', async () => {
    const mockEvent = {};

    const response = await handler(mockEvent);

    expect(response).toEqual({
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? 'Event body is missing.' : 'An unexpected error occurred.',
      }),
      isBase64Encoded: false,
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error processing logs:', expect.any(Error));
  });

  test('로그 스트림을 보장하는 동안 오류가 발생하면 적절히 처리해야 합니다', async () => {
    const mockEvent = {
      body: JSON.stringify({
        logs: [
          { timestampMs: 1697990400000, sequenceNumber: '1', logLevel: 'INFO', message: 'Test log' },
        ],
        appName: 'TestApp',
        timestamp: 1697990400,
      }),
    };

    const mockLogStreamName = 'ChimeReactSDKMeeting_1697990400';
    ensureLogStream.mockRejectedValue(new Error('Failed to ensure log stream.'));

    const response = await handler(mockEvent);

    expect(response).toEqual({
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? 'Failed to ensure log stream.' : 'An unexpected error occurred.',
      }),
      isBase64Encoded: false,
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      `Error ensuring log stream "${mockLogStreamName}":`,
      expect.any(Error)
    );
  });

  test('로그 이벤트 업로드 중 오류가 발생하면 적절히 처리해야 합니다', async () => {
    const mockEvent = {
      body: JSON.stringify({
        logs: [
          { timestampMs: 1697990400000, sequenceNumber: '1', logLevel: 'INFO', message: 'Test log' },
        ],
        appName: 'TestApp',
        timestamp: 1697990400,
      }),
    };

    const mockLogStreamName = 'ChimeReactSDKMeeting_1697990400';
    const mockSequenceToken = 'mockSequenceToken';

    ensureLogStream.mockResolvedValue(mockSequenceToken);
    mockCloudWatchClient.putLogEvents.mockRejectedValue(new Error('Failed to upload log events.'));

    const response = await handler(mockEvent);

    expect(response).toEqual({
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? 'Failed to upload log events.' : 'An unexpected error occurred.',
      }),
      isBase64Encoded: false,
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Error uploading log events to CloudWatch:', expect.any(Error));
  });
});
