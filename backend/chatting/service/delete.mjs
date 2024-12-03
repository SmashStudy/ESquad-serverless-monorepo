import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

// DynamoDB 클라이언트 설정
const client = new DynamoDBClient({ region: process.env.CHATTING_REGION });
const docClient = DynamoDBDocumentClient.from(client);

// Lambda 함수 핸들러
export const handler = async (event) => {
    try {
        console.log("Received event:", JSON.stringify(event, null, 2));
        const { room_id, message, timestamp, fileKey } = JSON.parse(event.body);

        // 필수 필드 검증
        if (!room_id || !message || !timestamp) {
            console.error("Missing or invalid required fields:", { room_id, message, timestamp });
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing or invalid required fields" }),
            };
        }

        if (!fileKey && message.includes("파일 업로드 완료")) {
            console.error("fileKey missing for file message:", { room_id, timestamp, fileKey });
            return {
                statusCode: 400,
                body: JSON.stringify({ error: "Missing fileKey for file message" }),
            };
        }

        const key = {
            room_id: String(room_id),
            timestamp: Number(timestamp),
        };

        // 삭제할 항목의 Command 설정
        const command = new DeleteCommand({
            TableName: process.env.MESSAGE_TABLE_NAME,
            Key: key,
            ReturnValues: "ALL_OLD",
        });

        // DynamoDB에서 삭제 실행
        const result = await docClient.send(command);
        console.log("Delete command result:", JSON.stringify(result, null, 2));

        if (!result.Attributes) {
            console.warn("Message not found:", key);
            return {
                statusCode: 404,
                body: JSON.stringify({ error: "Message Not Found" }),
            };
        }

        const deleteMessage = {
            type: "deleteMessage",
            room_id,
            timestamp: Number(timestamp),
            fileKey: fileKey || null,
        }

        const apiGatewayManagementApi = new ApiGatewayManagementApiClient({
            apiVersion: "2018-11-29",
            endpoint: `${event.requestContext.domainName}/${event.requestContext.stage}`,
        });

        const connections = await docClient.send(
            new QueryCommand({
                TableName: process.env.USERLIST_TABLE_NAME,
                IndexName: "room_id-user_id-index",
                KeyConditionExpression: "room_id = :room_id",
                ExpressionAttributeValues: {
                    ":room_id": room_id,
                },
            })
        );

        const postCalls = connections.Items.map(async ({ connection_id }) => {
            try {
                await apiGatewayManagementApi.send(
                    new PostToConnectionCommand({
                        ConnectionId: connection_id,
                        Data: JSON.stringify(deletedMessage),
                    })
                );
            } catch (e) {
                if (e.statusCode === 410) {
                    console.log(`Stale connection detected for connection_id: ${connection_id}`);
                    await docClient.send(
                        new DeleteCommand({
                            TableName: process.env.USERLIST_TABLE_NAME,
                            Key: { connection_id },
                        })
                    );
                } else {
                    console.error(`Failed to send WebSocket message to ${connection_id}`, e);
                }
            }
        });

        await Promise.all(postCalls);

        // 성공적인 삭제 후 결과 반환
        console.log("Deleted item:", result.Attributes);
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // 모든 출처 허용
                "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            body: JSON.stringify(result.Attributes),
        };
    } catch (error) {
        console.error("Error during deletion:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: "Can't delete Chat message",
                errorDetails: error.message,
            }),
        };
    }
};
