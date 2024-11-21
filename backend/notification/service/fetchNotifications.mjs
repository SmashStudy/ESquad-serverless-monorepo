import { DynamoDBClient, QueryCommand} from "@aws-sdk/client-dynamodb";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

const dynamoDb = new DynamoDBClient({ region: process.env.AWS_REGION });

const NOTIFICATION_TABLE = process.env.NOTIFICATION_DYNAMODB_TABLE;
const CONNECTIONS_TABLE = process.env.NOTIFICATION_CONNECTIONS_DYNAMODB_TABLE;
const NOTIFICATION_CONNECTION_USER_INDEX = process.env.NOTIFICATION_WEBSOCKET_CONNECTION_USER_INDEX;
const ENDPOINT = `https://ro2goaptcf.execute-api.${process.env.AWS_REGION}.amazonaws.com/dev`;

// WebSocket 으로 메시지 전송
const sendToConnection = async (connectionId, payload) => {
    if (!connectionId || !payload) {
        throw new Error("connectionId와 message는 필수입니다."); // 필수 매개변수 검증
    }

    const apiClient = new ApiGatewayManagementApiClient({
        endpoint: ENDPOINT
    });

    try {
        await apiClient.send(
            new PostToConnectionCommand({
                ConnectionId: connectionId,
                Data: JSON.stringify(payload),  // 메시지를 JSON 형식으로 전송
            })
        );
        console.log(`Message sent to connectionId ${connectionId}`);
    } catch (error) {
        console.error("Failed to send message:", error);
    }
};

export const handler = async (event) => {
    console.log(`EVENT: \n${JSON.stringify(event, null, 2)}`);

    const { userId } = JSON.parse(event.body);
    const connectionId = event.requestContext.connectionId;

    try {
        const command = new QueryCommand({
            TableName: NOTIFICATION_TABLE,
            IndexName: NOTIFICATION_CONNECTION_USER_INDEX,
            KeyConditionExpression:'#userId = :userId',     // GSI의 파티션 키(userId)와 비교하는 조건식
            ExpressionAttributeNames: {
                '#userId': 'userId',                        // 'userId'라는 실제 필드명을 매핑
            },
            ExpressionAttributeValues: {                    // KeyConditionExpression에서 사용하는 값 정의
                ':userId': { S: userId },
                // ":isRead": { N: "0" },
            },
            // ProjectionExpression: 'connectionId',           // 결과에서 반환할 속성을 지정 (connectionId만 반환)
        });
        const rawData = await dynamoDb.send(command);
        const response = rawData.Items.map((data) => ({
            id: data.id.S,
            userId: data.userId.S,
            sender: data.sender.S,
            message: data.message.S,
            isRead: data.isRead.N,
            createdAt: data.createdAt.S,
        }));
        console.log(`Read notifications: ${JSON.stringify(response)}`);
        await sendToConnection(connectionId, { response });
        return {
            statusCode: 200,
        };
    } catch (error) {
        // 메시지 전송 실패 시 에러 로그 출력
        if (error.name === 'GoneException') {
            // 클라이언트가 연결을 끊었을 경우 해당 연결을 DynamoDB에서 삭제
            console.error(`Connection ${connectionId} is gone, deleting from DynamoDB`);
            await dynamoDb.send(
                new DeleteCommand({
                    TableName: CONNECTIONS_TABLE,
                    Key: { connectionId },
                })
            );
            return { statusCode: 400 };
        } else {
            console.error(`Failed to send message to connection ${connectionId}:`, error);
            return { statusCode: 500 };
        }
    }
};
