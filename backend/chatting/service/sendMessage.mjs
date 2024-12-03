import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

// DynamoDB 클라이언트 및 Document 클라이언트 생성
const ddbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const ddb = DynamoDBDocumentClient.from(ddbClient);

export const handler = async (event) => {
    // 이벤트에서 연결 ID와 요청 컨텍스트를 추출
    const { requestContext } = event;
    // 이벤트 본문에서 메시지, 방 ID, 사용자 ID를 추출
    const { message, room_id, user_id, fileKey, contentType, originalFileName } = JSON.parse(event.body);


    // API Gateway Management API 클라이언트 생성
    const apiGatewayManagementApi = new ApiGatewayManagementApiClient({
        apiVersion: "2018-11-29",
        endpoint: `${requestContext.domainName}/${requestContext.stage}`,
    });

    try {
        const messageItem = {
            room_id,
            timestamp: Date.now(),
            message,
            user_id,
        };

        if (fileKey) {
            messageItem.fileKey = fileKey;
            messageItem.contentType = contentType;
            messageItem.originalFileName = originalFileName;
        }
        // 메시지를 DynamoDB에 저장
        await ddb.send(new PutCommand({
            TableName: process.env.MESSAGES_TABLE_NAME,
            Item: messageItem,
        }));

        // 같은 방에 있는 모든 연결된 클라이언트 조회
        const connections = await ddb.send(new QueryCommand({
            TableName: process.env.USERLIST_TABLE_NAME,
            IndexName: "room_id-user_id-index",
            KeyConditionExpression: "room_id = :room_id",
            ExpressionAttributeValues: {
                ":room_id": room_id,
            },
        }));

        // 모든 연결된 클라이언트에게 메시지 전송
        const postCalls = connections.Items.map(async ({ connection_id }) => {
            try {
                const dataToSend = { message, user_id };
                if (fileKey) {
                    dataToSend.fileKey = fileKey;
                    dataToSend.contentType = contentType;
                    dataToSend.originalFileName = originalFileName;
                }
                await apiGatewayManagementApi.send(new PostToConnectionCommand({
                    ConnectionId: connection_id,
                    Data: JSON.stringify(dataToSend),
                }));
            } catch (e) {
                if (e.statusCode === 410) {
                    // 연결이 더 이상 존재하지 않으면 DynamoDB에서 해당 연결 정보 제거
                    await ddb.send(new DeleteCommand({
                        TableName: process.env.USERLIST_TABLE_NAME,
                        Key: { connection_id },
                    }));
                }
            }
        });

        // 모든 메시지 전송 작업이 완료될 때까지 대기
        await Promise.all(postCalls);

        // 성공 응답 반환
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // 모든 출처 허용
                "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ status: 'success', message: 'Message sent.' })
        };
    } catch (e) {
        // 오류 발생 시 500 상태 코드와 오류 스택 반환
        return { statusCode: 500, body: JSON.stringify({ error: e.stack }) };
    }
};
