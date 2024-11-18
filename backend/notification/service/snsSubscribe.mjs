import fetch from "node-fetch";     // node-fetch를 사용하여 SNS Subscription URL 확인
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });

export const handler = async (event) => {
    console.log("Received Event:", JSON.stringify(event, null, 2));
    const headers = event.headers;
    const body = JSON.parse(event.body);

    const messageType = headers["x-amz-sns-message-type"];

    if (!messageType) {
        console.error("Invalid SNS request: Missing x-amz-sns-message-type header.");
        return {
            statusCode: 400,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: "Invalid SNS request: Missing headers." }),
        };
    }

    try {
        // 1. SubscriptionConfirmation 처리
        if (messageType === "SubscriptionConfirmation") {
            // 확인 URL 가져오기
            const subscribeURL = body.SubscribeURL;
            console.log(`Confirming subscription at: ${subscribeURL}`);

            // Subscription 확인 요청
            const response = await fetch(subscribeURL);
            if (!response.ok) {
                throw new Error(`Failed to confirm subscription. HTTP status: ${response.status}`);
            }
            console.log("Subscription confirmed.");

            return {
                statusCode: 200,
                body: JSON.stringify({ message: "Subscription confirmed." }),
            };
        }

        // 2. Notification 메시지 처리
        else if (messageType === "Notification") {
            const message = body.Message;
            const userId = body.MessageAttributes?.userId?.Value;

            if (!userId) {
                console.error("UserId not found in SNS MessageAttributes.");
                return {
                    statusCode: 400,
                    body: JSON.stringify({ error: "Missing userId in SNS MessageAttributes." }),
                };
            }

            const payload = {
                userId,
                message,
                sender: body.Sender,
                timestamp: body.Timestamp,
            };
            console.log(`Forwarding message to user ${userId}:`, payload);

            // const queryParams = new URLSearchParams(payload).toString();
            // const clientEndpoint = 'https://xh62xc6iy8.execute-api.us-east-1.amazonaws.com/dev/notification/send'; // 클라이언트 HTTP URL
            // const clientResponse = await fetch(clientEndpoint, {
            //     method: "GET",
            //     headers: {
            //         "Content-Type": "text/event-stream",
            //         "Cache-Control": "no-cache",
            //         "Connection": "keep-alive"
            //     },
            //     // body: JSON.stringify(payload),
            // });
            //
            // if (!clientResponse.ok) {
            //     throw new Error(`Failed to send notification to client. HTTP status: ${clientResponse.status}`);
            // }
            // console.log("Notification forwarded to client successfully.");

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "Notification processed and forwarded successfully.",
                }),
            };

            // const headers = {
            //     "Content-Type": "text/event-stream",
            //     "Cache-Control": "no-cache",
            //     "Connection": "keep-alive",
            //     "Access-Control-Allow-Origin": "*", // Allow all origins
            //     "Access-Control-Allow-Methods": "GET",
            //     "x-amz-sns-message-type": "Notification",
            // };
            // const responseBody = JSON.stringify(payload);

            // 성공적으로 처리된 메시지 응답
            // return {
            //     statusCode: 200,
            //     headers,
            //     body: responseBody,
            //     isBase64Encoded: false,
            // };
        }

        // 3. 기타 처리되지 않은 메시지 유형
        else {
            console.warn("Unknown SNS message type:", messageType);
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Unknown SNS message type." }),
            };
        }
    } catch (error) {
        console.error("Error processing SNS message:", error);
        return {
            statusCode: 500,
            headers: { "Content-Type": "text/plain" },
            body: JSON.stringify({ message: "Error processing Notification message.", error: error.message }),
        };
    }
};
