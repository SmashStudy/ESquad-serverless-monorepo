import { CORS_HEADERS, handleOptions } from '../service/corsConfig.mjs';

describe('CORS_HEADERS 상수', () => {
  it('CORS_HEADERS는 올바른 CORS 헤더를 포함해야 합니다', () => {
    expect(CORS_HEADERS).toEqual({
      "Access-Control-Allow-Origin": "https://live.dev.esquad.click",
      "Access-Control-Allow-Credentials": true,
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET"
    });
  });
});

describe('handleOptions 함수', () => {
  it('handleOptions는 올바른 CORS 응답 객체를 반환해야 합니다', () => {
    const expectedResponse = {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: ''
    };

    expect(handleOptions()).toEqual(expectedResponse);
  });

  it('handleOptions는 응답 객체의 body가 빈 문자열이어야 합니다', () => {
    const response = handleOptions();
    expect(response.body).toBe('');
  });

  it('handleOptions는 응답 객체의 statusCode가 200이어야 합니다', () => {
    const response = handleOptions();
    expect(response.statusCode).toBe(200);
  });

  it('handleOptions는 응답 객체에 CORS_HEADERS가 포함되어야 합니다', () => {
    const response = handleOptions();
    expect(response.headers).toBe(CORS_HEADERS);
  });
});
