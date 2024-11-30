import { jest } from '@jest/globals';

describe('endMeetingHandler 테스트', () => {
  let handler;
  let deleteMeeting;
  let corsConfig;

  // 모킹 함수 및 변수 선언
  const mockDeleteMeeting = jest.fn();
  const mockHandleOptions = jest.fn();
  const mockCORS_HEADERS = { 'Content-Type': 'application/json' };

  beforeAll(async () => {
    // 환경 변수 설정 (필요한 경우)
    process.env.SOME_ENV_VARIABLE = 'value';

    // 모듈 모킹
    jest.mock('../src/deleteMeeting.mjs', () => ({
      __esModule: true,
      deleteMeeting: mockDeleteMeeting,
    }));

    jest.mock('../src/corsConfig.mjs', () => ({
      __esModule: true,
      handleOptions: mockHandleOptions,
      CORS_HEADERS: mockCORS_HEADERS,
    }));

    // 모킹된 모듈 가져오기
    ({ handler } = await import('../src/endMeetingHandler.mjs'));
    ({ deleteMeeting } = await import('../src/deleteMeeting.mjs'));
    corsConfig = await import('../src/corsConfig.mjs');
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('OPTIONS 요청을 처리해야 합니다.', async () => {
    // Mock handleOptions
    mockHandleOptions.mockReturnValue({
      statusCode: 200,
      headers: corsConfig.CORS_HEADERS,
      body: null,
    });

    const event = { httpMethod: 'OPTIONS' };
    const response = await handler(event);

    expect(corsConfig.handleOptions).toHaveBeenCalled();
    expect(response).toEqual({
      statusCode: 200,
      headers: corsConfig.CORS_HEADERS,
      body: null,
    });
  });

  test('title이 누락된 경우 400을 반환해야 합니다.', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({}),
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    expect(response.headers).toEqual(corsConfig.CORS_HEADERS);
    expect(response.body).toEqual(
      JSON.stringify({ message: 'Title is required' })
    );
  });

  test('deleteMeeting이 성공하면 200을 반환해야 합니다.', async () => {
    const mockResponse = { message: 'Meeting deleted successfully' };
    mockDeleteMeeting.mockResolvedValue(mockResponse);

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ title: 'Test Meeting' }),
    };

    const response = await handler(event);

    expect(deleteMeeting).toHaveBeenCalledWith('Test Meeting');
    expect(response.statusCode).toBe(200);
    expect(response.headers).toEqual(corsConfig.CORS_HEADERS);
    expect(response.body).toEqual(JSON.stringify(mockResponse));
  });

  test('미팅이 존재하지 않을 경우 404를 반환해야 합니다.', async () => {
    const error = new Error('Meeting not found');
    mockDeleteMeeting.mockRejectedValue(error);

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ title: 'Nonexistent Meeting' }),
    };

    const response = await handler(event);

    expect(deleteMeeting).toHaveBeenCalledWith('Nonexistent Meeting');
    expect(response.statusCode).toBe(404);
    expect(response.headers).toEqual(corsConfig.CORS_HEADERS);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Meeting not found',
      error: 'Meeting not found',
    });
  });

  test('기타 오류가 발생한 경우 500을 반환해야 합니다.', async () => {
    const error = new Error('Internal Server Error');
    mockDeleteMeeting.mockRejectedValue(error);

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ title: 'Test Meeting' }),
    };

    const response = await handler(event);

    expect(deleteMeeting).toHaveBeenCalledWith('Test Meeting');
    expect(response.statusCode).toBe(500);
    expect(response.headers).toEqual(corsConfig.CORS_HEADERS);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Internal Server Error',
      error: 'Internal Server Error',
    });
  });
});
