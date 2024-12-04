// HTTP 응답 생성 유틸리티 함수

export const createResponse = (statusCode, body) => ({
    statusCode,
    body: typeof body === 'object' ? JSON.stringify(body) : body,
    headers: {
        'Access-Control-Allow-Origin': `${process.env.ALLOWED_ORIGIN}`,
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT,DELETE',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    },
});