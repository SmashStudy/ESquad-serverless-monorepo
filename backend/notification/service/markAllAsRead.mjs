import { DynamoDBClient, UpdateCommand } from '@aws-sdk/client-dynamodb';

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const NOTIFICATION_TABLE = process.env.NOTIFICATION_DYNAMODB_TABLE;
const NOTIFICATION_INDEX = process.env.NOTIFICATION_INDEX;

export const handler = async (event) => {
    console.log(`event is ${JSON.stringify(event, null, 2)}`);

    const { notificationIds } = JSON.parse(event.body);
    if (!notificationIds || !notificationIds.length) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "No notification IDs provided." }),
        };
    }

    try {
        // 읽지 않은 모든 알림을 읽음 처리
        const updatePromises = notificationIds.map((id) => {
            const updateParams = {
                TableName: NOTIFICATION_TABLE,
                Key: {
                    id: { S: id },
                },
                UpdateExpression: "SET isRead = :isRead",
                ExpressionAttributeValues: {
                    ":isRead": { N: "1" }, // Mark as read
                },
            }

            const updateCommand = new UpdateCommand(updateParams);
            return dynamoDbClient.send(updateCommand);
        });

        // 모든 업데이트 요청 병렬 실행
        await Promise.all(updatePromises);

        return {
            statusCode: 200,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*', // 개발 단계: '*', 프로덕션: 특정 도메인
                'Access-Control-Allow-Methods': 'OPTIONS, POST', 
                'Access-Control-Allow-Headers': 'Content-Type', 
            },
            body: JSON.stringify({
                message: "Notifications marked as read.",
            }),
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