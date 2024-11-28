export const createResponse = (statusCode, body) => ({
    statusCode,
    body: typeof body === 'object' ? JSON.stringify(body) : body,
    headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': `${process.env.ALLOWED_ORIGIN}`,
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE',
    },
});