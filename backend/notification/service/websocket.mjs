import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";


const CONNECTIONS_TABLE = process.env.NOTIFICATION_CONNECTIONS_DYNAMODB_TABLE;
const USER_INDEX_NAME = process.env.NOTIFICATION_WEBSOCKET_CONNECTION_USER_INDEX;

const dynamodbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const apigClient = new ApiGatewayManagementApiClient({
    endpoint: process.env.SOCKET_API_ENDPOINT,
});

export const handler = async (event) => {
    console.log(`EVENT: \n${JSON.stringify(event, null, 2)}`); // 이벤트 로그 출력

    const {
        body,
        requestContext: { connectionId, routeKey },
    } = event; // WebSocket 요청에서 데이터 추출

    try {
        // routeKey를 기반으로 요청 처리
        switch (routeKey) {
            case "$connect":
                // 클라이언트 연결 요청 처리
                let userId = event.queryStringParameters?.userId; // queryString에서 userId 가져오기
                userId = decodeURIComponent(userId);

                if (!userId) throw new Error("userId query parameter is required for $connect");

                // 연결 정보를 DynamoDB에 저장
                await dynamodbClient.send(
                    new PutCommand({
                        TableName: CONNECTIONS_TABLE,
                        Item: {connectionId, userId}, // connectionId와 userId를 저장
                    })
                );
                break;

            case "$disconnect":
                // 클라이언트 연결 해제 요청 처리
                await dynamodbClient.send(
                    new DeleteCommand({
                        TableName: CONNECTIONS_TABLE,
                        Key: {connectionId}, // connectionId를 기반으로 삭제
                    })
                );
                break;

            // case "sendNotification":
            //     // 알림 전송 요청 처리
            //     const {targetUserId, message} = JSON.parse(body); // body에서 targetUserId와 message 추출
            //     if (!targetUserId || !message) {
            //         throw new Error("Body must include targetUserId and message");
            //     }
            //
            //     // DynamoDB에서 targetUserId에 연결된 모든 connectionId 조회
            //     const connectionsResponse = await dynamodbClient.send(
            //         new QueryCommand({
            //             TableName: CONNECTIONS_TABLE,
            //             IndexName: USER_INDEX_NAME,
            //             KeyConditionExpression: "userId = :userId",
            //             ExpressionAttributeValues: {
            //                 ":userId": targetUserId,
            //             },
            //         })
            //     );
            //
            //     // 조회된 각 connectionId로 메시지 전송
            //     const promises = connectionsResponse.Items.map((connection) =>
            //         sendNotificationMessage(connection.connectionId, message)
            //     );
            //     await Promise.all(promises); // 병렬 전송
            //     break;


            default:
                // 기본 처리 : 예상치 못한 routeKey 처리
                await sendWebSocketMessage(connectionId, `Received on $default: ${body}`);
        }

        return { statusCode: 200 }; // 성공 응답
    } catch (error) {
        // 오류 처리
        console.error("Error handling WebSocket event:", error);
        return { statusCode: 500, body: "Internal Server Error" }; // 실패 응답
    }
};
