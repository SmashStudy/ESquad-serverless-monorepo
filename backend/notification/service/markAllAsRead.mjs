import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const TABLE_NAME = process.env.NOTIFICATION_DYNAMODB_TABLE;

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
        for (const id of notificationIds) {
            await dynamoDbClient.send(
                new UpdateItemCommand({
                    TableName: TABLE_NAME,
                    Key: { id: { S: id } },
                    UpdateExpression: "SET isRead = :isRead",
                    ExpressionAttributeValues: {
                        ":isRead": { N: "1" }, // Mark as read
                    },
                })
            );
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Notifications marked as read." }),
        };
    } catch (error) {
        console.error("Error marking notifications as read:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to mark notifications as read." }),
        };
    }
};