import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { createResponse } from '../utils/responseHelper.mjs';

const client = new DynamoDBClient({ region: 'us-east-1' });
const ddbDocClient = DynamoDBDocumentClient.from(client);

export const getUserNickname = async (event) => {
    try {
        // 1. Extract email from query parameters or body
        const { email } = JSON.parse(event.body);
        if (!email) {
            return createResponse(400, { error: 'Email is required' });
        }

        // 2. Define DynamoDB query parameters
        const params = {
            TableName: 'esquad-table-user-local',
            Key: { email }, // PK
        };

        // 3. Execute DynamoDB query
        const result = await ddbDocClient.send(new GetCommand(params));

        if (!result.Item) {
            return createResponse(404, { error: `User with email ${email} not found` });
        }

        // 4. Return the nickname
        return createResponse(200, {
            message: 'User found successfully',
            data: {
                email: result.Item.email,
                name: result.Item.name,
                nickname: result.Item.nickname,
                createdAt: result.Item.createdAt,
            },
        });
    } catch (error) {
        console.error('Error retrieving user nickname:', error);
        return createResponse(500, { error: `Error retrieving user nickname: ${error.message}` });
    }
};

