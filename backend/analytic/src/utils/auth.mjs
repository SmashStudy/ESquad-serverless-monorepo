import jwt from 'jsonwebtoken';

export const decodeToken = (headers) => {

    const authorizationHeader = headers.Authorization || headers.authorization;
    if (!authorizationHeader) {
        throw new Error('Unauthorized: No Authorization header provided');
    }

    const token = authorizationHeader.startsWith('Bearer ') 
        ? authorizationHeader.split(' ')[1] 
        : null;
    if (!token) {
        throw new Error('Invalid Authorization header format');
    }

    return jwt.decode(token);
};