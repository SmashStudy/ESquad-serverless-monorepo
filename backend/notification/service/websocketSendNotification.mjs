import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

const apiGatewayClient = new ApiGatewayManagementApiClient({
    endpoint: process.env.API_GATEWAY_WEBSOCKET_ENDPOINT,
});

export const handler = async (event) => {
    const { connectionId } = event.requestContext;
    const message = JSON.parse(event.body).message;

    console.log(`Received message from ${connectionId}:`, message);

    try {
        // Example: Echo the message back to the same client
        await apiGatewayClient.send(
            new PostToConnectionCommand({
                ConnectionId: connectionId,
                Data: JSON.stringify({ message: `Echo: ${message}` }),
            })
        );
        console.log(`Message sent back to connection: ${connectionId}`);
        return { statusCode: 200 };
    } catch (err) {
        console.error("Error sending message:", err);
        return { statusCode: 500, body: "Failed to send message." };
    }
};
