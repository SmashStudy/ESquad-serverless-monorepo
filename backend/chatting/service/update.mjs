import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.CHATTING_REGION });
const docClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    const { room_id, message, newMessage, timestamp } = JSON.parse(event.body);

    if (!room_id || !message || !newMessage || !timestamp) {
        console.error("Validation Failed: Missing required fields");
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing required fields" }),
        };
    }

    try {
        const command = new UpdateCommand({
            TableName: process.env.MESSAGE_TABLE_NAME,
            Key: {
                room_id: room_id,
                timestamp: Number(timestamp),
            },
            UpdateExpression: "SET message = :newMessage",
            ExpressionAttributeValues: {
                ":newMessage": newMessage,
            },
            ReturnValues: "ALL_NEW",
        });

        const result = await docClient.send(command);
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // 모든 출처 허용
                "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify(result.Attributes),
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Can't edit chat message",
                details: error.message,
            }),
        };
    }
};
