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
    process.env.BROWSER_LOG_GROUP_NAME = 'TestLogGroupName'; 
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
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

    const formatDateToISOString = (timestampMs) => {
      return new Date(timestampMs).toISOString();
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

    // 실제 코드의 성공 메시지는 한글로 되어 있음.
    expect(response).toEqual({
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '로그가 성공적으로 처리되었습니다.' }),
      isBase64Encoded: false,
    });

    expect(consoleLogSpy).toHaveBeenCalledWith('수신된 이벤트:', expect.any(String));
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

    // 실제 코드에서 필수 파라미터가 없을 때 반환하는 메시지: '필수 파라미터가 누락되었습니다.'
    expect(response).toEqual({
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: '필수 파라미터가 누락되었습니다.' }),
      isBase64Encoded: false,
    });

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('이벤트 본문이 없는 경우 500 상태 코드를 반환해야 합니다', async () => {
    const mockEvent = {};

    const response = await handler(mockEvent);

    // 실제 코드에서 에러 시 반환하는 한글 메시지: '서버 내부 오류가 발생했습니다.' 
    // 그리고 error는 개발 환경이 아닐 경우 '예기치 않은 오류가 발생했습니다.'
    expect(response).toEqual({
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '서버 내부 오류가 발생했습니다.',
        error: '예기치 않은 오류가 발생했습니다.',
      }),
      isBase64Encoded: false,
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
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
        message: '서버 내부 오류가 발생했습니다.',
        error: '예기치 않은 오류가 발생했습니다.',
      }),
      isBase64Encoded: false,
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
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
        message: '서버 내부 오류가 발생했습니다.',
        error: '예기치 않은 오류가 발생했습니다.',
      }),
      isBase64Encoded: false,
    });

    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
