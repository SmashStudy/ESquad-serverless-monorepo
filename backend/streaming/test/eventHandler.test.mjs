import { handler } from '../service/eventHandler.mjs';

describe('EventBridge Lambda Handler', () => {
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();

    // console.log와 console.error 모킹
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  test('성공적으로 이벤트를 처리해야 합니다', async () => {
    const mockEvent = {
      'detail-type': 'SomeEventType',
      detail: { key: 'value' },
    };

    const response = await handler(mockEvent);

    // 응답 검증
    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify({ message: 'Event processed successfully' }),
    });

    // 로그 검증
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Received Event:',
      JSON.stringify(mockEvent, null, 2)
    );
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('오류가 발생하면 적절한 오류 메시지를 반환해야 합니다', async () => {
    const mockEvent = null; // 잘못된 이벤트로 오류를 유발
    const mockError = new Error('Event processing failed');

    jest.spyOn(JSON, 'stringify').mockImplementationOnce(() => {
      throw mockError;
    });

    const response = await handler(mockEvent);

    // 응답 검증
    expect(response).toEqual({
      statusCode: 500,
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: mockError.message,
      }),
    });

    // 오류 로그 검증
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error processing event:', mockError);
  });
});
