import { handler } from '../service/sqsHandler.mjs';

describe('SQS Handler', () => {
  let consoleLogSpy;
  let consoleErrorSpy;
  let consoleWarnSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  test('SQS 이벤트를 성공적으로 처리해야 합니다', async () => {
    const mockEvent = {
      Records: [
        { body: JSON.stringify({ id: 1, type: 'TestType', payload: 'data1' }) },
        { body: JSON.stringify({ id: 2, type: 'TestType', payload: 'data2' }) },
      ],
    };

    const response = await handler(mockEvent);

    expect(response).toEqual({
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'SQS records processed successfully.' }),
      isBase64Encoded: false,
    });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Received SQS Event:',
      JSON.stringify(mockEvent, null, 2)
    );
    expect(consoleLogSpy).toHaveBeenCalledWith('Processed message:', {
      id: 1,
      type: 'TestType',
      payload: 'data1',
    });
    expect(consoleLogSpy).toHaveBeenCalledWith('Processed message:', {
      id: 2,
      type: 'TestType',
      payload: 'data2',
    });
    expect(consoleWarnSpy).not.toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('레코드가 없거나 배열이 아닌 경우 400 상태 코드를 반환해야 합니다', async () => {
    const invalidEvent = {};

    const response = await handler(invalidEvent);

    expect(response).toEqual({
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Invalid event structure: Records are missing or not an array.',
      }),
      isBase64Encoded: false,
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Invalid event structure: Records are missing or not an array.'
    );
  });

  test('레코드에 body가 없으면 경고를 출력하고 넘어가야 합니다', async () => {
    const mockEvent = {
      Records: [{ body: null }],
    };

    const response = await handler(mockEvent);

    expect(response).toEqual({
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'SQS records processed successfully.' }),
      isBase64Encoded: false,
    });

    expect(consoleWarnSpy).toHaveBeenCalledWith('Record is missing body:', { body: null });
    expect(consoleLogSpy).toHaveBeenCalledWith(
      'Received SQS Event:',
      JSON.stringify(mockEvent, null, 2)
    );
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('레코드 처리 중 JSON 파싱 오류가 발생하면 오류 로그를 출력해야 합니다', async () => {
    const mockEvent = {
      Records: [{ body: 'Invalid JSON' }],
    };

    const response = await handler(mockEvent);

    expect(response).toEqual({
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message: 'SQS records processed successfully.' }),
      isBase64Encoded: false,
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error processing record:',
      expect.any(SyntaxError),
      { body: 'Invalid JSON' }
    );
  });

  test('전체 처리 중 오류가 발생하면 500 상태 코드를 반환해야 합니다', async () => {
    const mockEvent = {
      Records: [
        { body: JSON.stringify({ id: 1, type: 'TestType', payload: 'data' }) },
      ],
    };

    // 실제 handler 내부의 에러 발생 상황을 시뮬레이션
    jest.spyOn(console, 'log').mockImplementationOnce(() => {
      throw new Error('Unexpected Error');
    });

    const response = await handler(mockEvent);

    expect(response).toEqual({
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? 'Unexpected Error' : undefined,
      }),
      isBase64Encoded: false,
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error processing SQS event:',
      expect.any(Error)
    );
  });
});
