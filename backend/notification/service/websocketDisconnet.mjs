import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";

const dynamoDBClient = new DynamoDBClient({});
const CONNECTIONS_TABLE = process.env.NOTIFICATION_CONNECTIONS_DYNAMODB_TABLE;

export const handler = async (event) => {
    const { connectionId } = event.requestContext;

    try {
        await dynamoDBClient.send(
            new DeleteItemCommand({
                TableName: CONNECTIONS_TABLE,
                Key: {
                    connectionId: { S: connectionId },
                },
            })
        );
        console.log(`Connection ID ${connectionId} removed.`);
        return { statusCode: 200 };
    } catch (err) {
        console.error("Error removing connection ID:", err);
        return { statusCode: 500, body: "Failed to disconnect." };
    }
};
