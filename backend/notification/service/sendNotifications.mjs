import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

const apigatewayClient = new ApiGatewayManagementApiClient({
    endpoint: process.env.SOCKET_API_ENDPOINT,
});

export const sendNotificationHandler = async (connectionId, message) => {
    if (!connectionId || !message) {
        throw new Error("connectionId와 message는 필수입니다."); // 필수 매개변수 검증
    }

    try {
        // WebSocket 메시지 전송 명령 생성
        const params = {
            ConnectionId: connectionId,
            Data: JSON.stringify({ message }), // 메시지를 JSON 형식으로 전송
        };
        const command = new PostToConnectionCommand(params);
        await apigatewayClient.send(command); // 메시지 전송
        console.log(`Message sent to connection: ${connectionId}`); // 성공 로그
    } catch (error) {
        // 메시지 전송 실패 시 에러 로그 출력
        if (error.name === 'GoneException') {
            // 클라이언트가 연결을 끊었을 경우 해당 연결을 DynamoDB에서 삭제
            console.error(`Connection ${connectionId} is gone, deleting from DynamoDB`);
            await dynamoClient.send(
                new DeleteCommand({
                    TableName: CONNECTIONS_TABLE,
                    Key: { connectionId },
                })
            );
        } else {
            console.error(`Failed to send message to connection ${connectionId}:`, error);
        }
    }
};
