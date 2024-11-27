import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const TABLE_NAME = process.env.NOTIFICATION_DYNAMODB_TABLE;
const NOTIFICATION_INDEX = process.env.NOTIFICATION_INDEX;

export const handler = async (event, context) => {
    console.log(`EVENT: \n${JSON.stringify(event, null, 2)}`);        
    console.log(`CONTEXT: \n${JSON.stringify(context, null, 2)}`);    
    
    const userId = event.queryStringParameters?.userId;
    console.log(`userId: ${userId}`);

    if (!userId) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Please provide userId.' }),
        };
    }

    const params = {
        TableName: TABLE_NAME,
        IndexName: NOTIFICATION_INDEX,
        KeyConditionExpression: "userId = :userId AND isRead = :isRead",
        ExpressionAttributeValues: {
            ":userId": { S: userId },
            ":isRead": { N: "0" }, // Unread notifications
        },
    };

    try {
        const data = await dynamoDbClient.send(new QueryCommand(params));
        const unreadMessages = data.Items.map((item) => ({
            id: item.id.S,
            userId: item.userId.S,
            message: item.message.S,
            sender: item.sender.S,
            isRead: item.isRead.N,
            createdAt: item.createdAt.S,
        }));

        // Ensure data is formatted correctly as per SSE requirements
        const formattedBody = unreadMessages
        .map((msg) => {
            return `data: ${JSON.stringify(msg)}\n\n`;
        })
        .join("");
        console.log(`formattedBody: ${formattedBody}`);

        return {
            statusCode: 200,
            headers: {
                // "Content-Type": "application/json",
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
                "Access-Control-Allow-Origin": "*",
            },
            body: formattedBody,
        };
    } catch (error) {
        console.error("Error fetching notifications:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Failed to fetch notifications" }),
        };
    }
    //
    // if (event.httpMethod !== "GET") {
    //     return {
    //         statusCode: 405,
    //         headers: { "Allow": "GET" },
    //         body: "Method Not Allowed",
    //     };
    // }
    //
    // const headers = {
    //     "Content-Type": "text/event-stream",
    //     "Cache-Control": "no-cache",
    //     "Connection": "keep-alive",
    //     "Access-Control-Allow-Origin": "*", // Allow all origins
    // };
    //
    // return {
    //     statusCode: 200,
    //     headers,
    //     body: "data: Streaming connection established\n\n",
    // };
};