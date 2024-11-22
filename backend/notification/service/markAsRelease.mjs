import {DynamoDBClient, QueryCommand} from '@aws-sdk/client-dynamodb';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const NOTIFICATION_TABLE = process.env.NOTIFICATION_DYNAMODB_TABLE;
const NOTIFICATION_INDEX = process.env.NOTIFICATION_INDEX;

export const handler = async (event) => {
    console.log(`event is ${JSON.stringify(event, null, 2)}`);

    const { notificationId, userId } = JSON.parse(event.body);
    console.log(`userId, notificationsId : ${userId}, ${notificationId}`);
    
    if (!notificationId || !userId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Must have Parameters" }),
        };
    }

    try {
        // 해당 알림 저장 처리
        const updateParam = {
            TableName: NOTIFICATION_TABLE,
            Key: {
                id: notificationId,     // HASH Key
                userId, // RANGE key
            },
            UpdateExpression: "SET isSave = :isSave",
            ExpressionAttributeValues: {
                ":isSave": 0,
            },
            ReturnValues: "ALL_NEW",  // 업데이트 후의 새로운 아이템을 반환하도록 설정
        }

        const updateCommand = new UpdateCommand(updateParam);
        const result = await dynamoDbClient.send(updateCommand);
        console.log(`Updated: ${JSON.stringify(result.Attributes)}`);

        // 객체 형식으로 반환할 수 있도록 업데이트된 아이템을 resultObject에 저장
        const resultObject = result.Attributes;
        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // 개발 단계: '*', 프로덕션: 특정 도메인
                'Access-Control-Allow-Methods': 'OPTIONS, POST', 
                'Access-Control-Allow-Headers': 'Content-Type', 
            },
            body: JSON.stringify(resultObject),
        };
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // 개발 단계: '*', 프로덕션: 특정 도메인
                'Access-Control-Allow-Methods': 'OPTIONS, POST', 
                'Access-Control-Allow-Headers': 'Content-Type', 
            },
            body: JSON.stringify({ error: "Failed to mark notifications as read." }),
        };
    }
};