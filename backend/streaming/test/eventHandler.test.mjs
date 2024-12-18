import { handler } from '../src/eventHandler.mjs';

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

    // 응답 검증 (한글 메시지로 수정)
    expect(response).toEqual({
      statusCode: 200,
      body: JSON.stringify({ message: '이벤트가 성공적으로 처리되었습니다.' }),
    });

    // 로그 검증 (한글 로그 메시지로 수정)
    expect(consoleLogSpy).toHaveBeenCalledWith(
      '수신된 이벤트:',
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

    // 응답 검증 (한글 메시지로 수정)
    expect(response).toEqual({
      statusCode: 500,
      body: JSON.stringify({
        message: '내부 서버 오류가 발생했습니다.',
        error: mockError.message,
      }),
    });

    // 오류 로그 검증 (한글 메시지로 수정)
    expect(consoleErrorSpy).toHaveBeenCalledWith('이벤트 처리 중 오류 발생:', mockError);
  });
});
