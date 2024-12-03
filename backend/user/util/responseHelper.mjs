export const createResponse = (statusCode, body) => ({
  statusCode,
  body: typeof body === 'object' ? JSON.stringify(body) : body,
  headers: {
    'Access-Control-Allow-Origin': `${process.env.ALLOWED_ORIGIN}`,
    'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE,PUT',
  },
});

export const createCredentialResponse = (statusCode, body) => ({
  statusCode,
  body: typeof body === 'object' ? JSON.stringify(body) : body,
  headers: {
    'Access-Control-Allow-Origin': `${process.env.ALLOWED_ORIGIN}`,
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token"',
    'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE,PUT',
    "Access-Control-Allow-Credentials": true,
  },
});

