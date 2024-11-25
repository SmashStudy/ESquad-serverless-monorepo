import AWS from "aws-sdk";
import file from "mime-types";

const ddb = new AWS.DynamoDB.DocumentClient();

export const handler = async (event) => {
    console.log("MESSAGES_TABLE_NAME:", process.env.MESSAGES_TABLE_NAME);
    console.log("USERLIST_TABLE_NAME:", process.env.USERLIST_TABLE_NAME);
    // 이벤트에서 연결 ID와 요청 컨텍스트를 추출
    const { connectionId, requestContext } = event;
    // 이벤트 본문에서 메시지, 방 ID, 사용자 ID를 추출
    const { message, room_id, user_id } = JSON.parse(event.body);

    // API Gateway Management API 클라이언트 생성
    const apiGatewayManagementApi = new AWS.ApiGatewayManagementApi({
        apiVersion: "2018-11-29",
        endpoint: `${requestContext.domainName}/${requestContext.stage}`,
    });

    try {
        // 메시지를 DynamoDB에 저장
        const now = Date.now();
        const item = {
            room_id,
            timestamp: now,
            message,
            fileKey: file?.fileKey || null,
            contentType: file?.contentType || null,
            originalFileName : file?.originalFileName || null,
        }
        await ddb
            .put({
                TableName: process.env.MESSAGE_TABLE_NAME,
                Item: item,
            })
            .promise();

        // 같은 방에 있는 모든 연결된 클라이언트 조회
        const connections = await ddb
            .query({
                TableName: process.env.USERLIST_TABLE_NAME,
                IndexName: "room_id-user_id-index",
                KeyConditionExpression: "room_id = :room_id",
                ExpressionAttributeValues: {
                    ":room_id": room_id,
                },
            })
            .promise();

        // 모든 연결된 클라이언트에게 메시지 전송
        const postCalls = connections.Items.map(async ({ connection_id }) => {
            try {
                await apiGatewayManagementApi
                    .postToConnection({
                        ConnectionId: connection_id,
                        Data: JSON.stringify({
                            message,
                            user_id,
                            timestamp: now,
                            fileKey: file?.fileKey || null,
                            contentType: file?.contentType || null,
                            originalFileName: file?.originalFileName || null}),
                    })
                    .promise();
            } catch (e) {
                if (e.statusCode === 410) {
                    // 연결이 더 이상 존재하지 않으면 DynamoDB에서 해당 연결 정보 제거
                    await ddb
                        .delete({
                            TableName: process.env.USERLIST_TABLE_NAME,
                            Key: { connection_id },
                        })
                        .promise();
                }
            }
        });

        // 모든 메시지 전송 작업이 완료될 때까지 대기
        await Promise.all(postCalls);

        // 성공 응답 반환
        return {
            statusCode: 200,
            body: JSON.stringify({
                status: "success",
                message: message,
                user_id: user_id,
                timestamp: now,
            }),
        };
    } catch (e) {
        // 오류 발생 시 500 상태 코드와 오류 스택 반환
        return { statusCode: 500, body: e.stack };
    }
};
