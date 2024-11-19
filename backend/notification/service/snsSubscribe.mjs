import { DynamoDBClient, ScanCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

const dynamoDBClient = new DynamoDBClient({});
const apiGatewayClient = new ApiGatewayManagementApiClient({
    endpoint: process.env.SOCKET_API_ENDPOINT,
});
const CONNECTIONS_TABLE = process.env.NOTIFICATION_CONNECTIONS_DYNAMODB_TABLE;

export const handler = async (event) => {
    const snsMessage = JSON.parse(event.Records[0].Sns.Message);

    console.log("Broadcasting message:", snsMessage);

    try {
        // Fetch all active WebSocket connections
        const connections = await dynamoDBClient.send(
            new ScanCommand({
                TableName: CONNECTIONS_TABLE,
            })
        );

        const connectionIds = connections.Items || [];
        console.log(`Found ${connectionIds.length} active connections.`);

        // Send the message to all connected clients
        const postCalls = connectionIds.map(async ({ connectionId }) => {
            const id = connectionId.S;
            try {
                await apiGatewayClient.send(
                    new PostToConnectionCommand({
                        ConnectionId: id,
                        Data: JSON.stringify(snsMessage),
                    })
                );
                console.log(`Message sent to connection: ${id}`);
            } catch (err) {
                if (err.$metadata?.httpStatusCode === 410) {
                    console.warn(`Stale connection detected, removing: ${id}`);
                    // Remove stale connection
                    await dynamoDBClient.send(
                        new DeleteItemCommand({
                            TableName: CONNECTIONS_TABLE,
                            Key: {
                                connectionId: { S: id },
                            },
                        })
                    );
                } else {
                    console.error(`Failed to send message to connection ${id}:`, err);
                }
            }
        });

        await Promise.all(postCalls);
        console.log("Broadcast completed.");
        return { statusCode: 200 };
    } catch (err) {
        console.error("Error broadcasting message:", err);
        return { statusCode: 500, body: "Failed to broadcast message." };
    }
};
