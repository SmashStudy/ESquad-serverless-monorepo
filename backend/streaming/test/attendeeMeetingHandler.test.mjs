import { jest } from '@jest/globals';

describe('attendeeMeetingHandler 테스트', () => {
  let handler;
  let getAttendee;
  let corsConfig;

  // 모킹된 함수 및 변수 선언
  const mockGetAttendee = jest.fn();
  const mockHandleOptions = jest.fn();
  const mockCORS_HEADERS = { 'Content-Type': 'application/json' };
  let consoleErrorSpy;

  beforeAll(async () => {
    // 모듈 모킹
    jest.mock('../service/getAttendee.mjs', () => ({
      __esModule: true,
      getAttendee: mockGetAttendee,
    }));

    jest.mock('../service/corsConfig.mjs', () => ({
      __esModule: true,
      handleOptions: mockHandleOptions,
      CORS_HEADERS: mockCORS_HEADERS,
    }));

    // 모킹된 모듈 가져오기
    ({ handler } = await import('../service/attendeeMeetingHandler.mjs'));
    ({ getAttendee } = await import('../service/getAttendee.mjs'));
    corsConfig = await import('../service/corsConfig.mjs');

    // console.error 모킹
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    // console.error 원래대로 복원
    consoleErrorSpy.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('OPTIONS 요청을 처리해야 합니다.', async () => {
    // handleOptions 함수의 반환값 모킹
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

  test('정상적인 요청에 대해 200을 반환해야 합니다.', async () => {
    const mockAttendeeName = '홍길동';
    mockGetAttendee.mockResolvedValue(mockAttendeeName);

    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        title: '테스트 미팅',
        attendeeId: 'attendee123',
      },
    };

    const response = await handler(event);

    expect(getAttendee).toHaveBeenCalledWith('테스트 미팅', 'attendee123');
    expect(response.statusCode).toBe(200);
    expect(response.headers).toEqual(corsConfig.CORS_HEADERS);
    expect(JSON.parse(response.body)).toEqual({
      AttendeeId: 'attendee123',
      Name: mockAttendeeName,
    });
  });

  test('getAttendee에서 에러 발생 시 500을 반환해야 합니다.', async () => {
    const error = new Error('Internal Server Error');
    mockGetAttendee.mockRejectedValue(error);

    const event = {
      httpMethod: 'GET',
      queryStringParameters: {
        title: '테스트 미팅',
        attendeeId: 'attendee123',
      },
    };

    const response = await handler(event);

    expect(getAttendee).toHaveBeenCalledWith('테스트 미팅', 'attendee123');
    expect(response.statusCode).toBe(500);
    expect(response.headers).toEqual(corsConfig.CORS_HEADERS);
    expect(JSON.parse(response.body)).toEqual({
      error: 'Internal Server Error',
    });
    // console.error가 한 번 호출되었는지 확인
    expect(consoleErrorSpy).toHaveBeenCalledWith(error);
  });

  test('queryStringParameters가 없을 경우 500을 반환해야 합니다.', async () => {
    const event = {
      httpMethod: 'GET',
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(500);
    expect(response.headers).toEqual(corsConfig.CORS_HEADERS);
    expect(JSON.parse(response.body)).toHaveProperty('error', 'Cannot read properties of undefined (reading \'title\')');
    // console.error가 한 번 호출되었는지 확인
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});
