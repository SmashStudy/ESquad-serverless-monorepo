import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, UpdateCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

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

        const apiGatewayManagementApi = new ApiGatewayManagementApiClient({
            apiVersion: "2018-11-29",
            endpoint: `${event.requestContext.domainName}/${event.requestContext.stage}`,
        });

        const connections = await docClient.send(new QueryCommand({
            TableName: process.env.USERLIST_TABLE_NAME,
            IndexName: "room_id-user_id-index",
            KeyConditionExpression: "room_id = :room_id",
            ExpressionAttributeValues: {
                ":room_id": room_id,
            },
        }));

        const updatedMessage = {
            type: "updateMessage",
            room_id,
            timestamp: Number(timestamp),
            message: newMessage,
        };

        const postCalls = connections.Items.map(async ({ connection_id }) => {
            try {
                await apiGatewayManagementApi.send(
                    new PostToConnectionCommand({
                        ConnectionId: connection_id,
                        Data: JSON.stringify(updatedMessage),
                    })
                );
            } catch (e) {
                if (e.statusCode === 410) {
                    await docClient.send(new DeleteCommand({
                        TableName: process.env.USERLIST_TABLE_NAME,
                        Key: { connection_id },
                    }));
                }
            }
        });

        await Promise.all(postCalls);

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
