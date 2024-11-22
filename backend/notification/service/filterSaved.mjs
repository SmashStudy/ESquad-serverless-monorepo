import {DynamoDBClient, QueryCommand, UpdateItemCommand} from '@aws-sdk/client-dynamodb';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const NOTIFICATION_TABLE = process.env.NOTIFICATION_DYNAMODB_TABLE;

export const handler = async (event) => {
    console.log(`event is ${JSON.stringify(event, null, 2)}`);

    let { userId } = event.queryStringParameters;
    userId = decodeURIComponent(userId);

    if (!userId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "No User IDs provided." }),
        };
    }

    try {

        // 1. 유저의 알림 모두 조회
        const queryCommand = new QueryCommand({
            TableName: NOTIFICATION_TABLE,
            KeyConditionExpression:'#userId = :userId',     // GSI의 파티션 키(userId)와 비교하는 조건식
            FilterExpression: "isSave = :isSave",
            ExpressionAttributeNames: {
                '#userId': 'userId',                        // 'userId'라는 실제 필드명을 매핑
            },
            ExpressionAttributeValues: {                    // KeyConditionExpression에서 사용하는 값 정의
                ':userId': { S: userId },
                ":isSave": { N: '1' },
            },
            ScanIndexForward: false,
        });
        const queryResponse = await client.send(queryCommand);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // 개발 단계: '*', 프로덕션: 특정 도메인
                'Access-Control-Allow-Methods': 'OPTIONS, GET',
                'Access-Control-Allow-Headers': 'Content-Type', 
            },
            body: JSON.stringify(queryResponse.Items),
        };
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // 개발 단계: '*', 프로덕션: 특정 도메인
                'Access-Control-Allow-Methods': 'OPTIONS, GET',
                'Access-Control-Allow-Headers': 'Content-Type', 
            },
            body: JSON.stringify({ error: "Failed to mark notifications as read." }),
        };
    }
};