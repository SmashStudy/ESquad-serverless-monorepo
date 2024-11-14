const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
    DynamoDBDocumentClient,
    DeleteCommand
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: process.env.CHATTING_REGION });
const docClient = DynamoDBDocumentClient.from(client);

exports.handler = async (event) => {
    try {
        const { room_id, message, timestamp } = JSON.parse(event.body);

        if (!room_id || !message || !timestamp) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing or invalid required fields" }),
            };
        }

        const command = new DeleteCommand({
            TableName: process.env.MESSAGES_TABLE_NAME,
            Key: {
                room_id: room_id,
                timestamp: Number(timestamp),
            },
            ReturnValues: "ALL_OLD",
        });

        const result = await docClient.send(command);
        if (!result.Attributes) {
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "Message Not Found" }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(result.Attributes),
        };
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Can't delete Chat message",
                errorDetails: error.message,
            }),
        };
    }
};
