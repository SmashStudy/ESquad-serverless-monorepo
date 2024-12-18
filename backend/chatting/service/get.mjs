import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

// 메시지 조회 테스트
const client = new DynamoDBClient();
const ddbDocClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    const roomId = event.queryStringParameters?.room_id;

    try {
        let command;
        if (roomId) {
            command = new QueryCommand({
                TableName: process.env.MESSAGE_TABLE_NAME,
                KeyConditionExpression: 'room_id = :roomId',
                ExpressionAttributeValues: {
                    ':roomId': roomId
                }
            });
        } else {
            command = new ScanCommand({
                TableName: process.env.MESSAGE_TABLE_NAME
            });
        }

        const result = await ddbDocClient.send(command);

        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': `${process.env.ALLOWED_ORIGIN}`,
                "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            body: JSON.stringify(result.Items)
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ 
                error: 'Could not retrieve chat messages',
                details: error.message
            })
        };
    }
};