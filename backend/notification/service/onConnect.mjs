import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import moment from "moment";

const CONNECTIONS_TABLE = process.env.NOTIFICATION_CONNECTIONS_DYNAMODB_TABLE;
const dynamodbClient = new DynamoDBClient({ region: process.env.AWS_REGION });

// 클라이언트 연결 요청 처리
export const handler = async (event) => {
    console.log(`EVENT: \n${JSON.stringify(event, null, 2)}`); // 이벤트 로그 출력

    let userId = event.queryStringParameters?.userId; // queryString에서 userId 가져오기
    userId = decodeURIComponent(userId);

    if (!userId) throw new Error("userId query parameter is required for $connect");

    try {
        // Check if the user already has a connection
        // const getUserConnectionsParams = {
        //     TableName: CONNECTIONS_TABLE,
        //     Key: { userId: userId },
        // };

        // const existingConnection = await dynamoDbClient.send(new DeleteCommand(getUserConnectionsParams));
        // if (existingConnection.Item) {
        //     console.log("Old connection deleted for user:", userId);
        // }
    
        // TTL 값 계산 (1시간 후에 만료되는 항목으로 설정)
        const ttl = Math.floor(Date.now() / 1000) + 3600; // 현재 시간 + 3600초 (1시간)

        // 연결 정보를 DynamoDB에 저장
        const addConnectionParams = {
            connectionId: event.requestContext.connectionId,
            userId: userId,
            timestamp: moment().valueOf(),
            ttl: ttl,
        };

        await dynamodbClient.send(
            new PutCommand({
                TableName: CONNECTIONS_TABLE,
                Item: addConnectionParams ,
            })
        );

        const response = {
            isBase64Encoded: true,
            statusCode: 200,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Access-Control-Expose-Headers": "*",
                "Access-Control-Allow-Origin": "*",
            },
            body: "ok",
        };

        return response;
    } catch(error) {
        console.error("Error while connecting WebSocket event:", error);
        return {
            isBase64Encoded: true,
            statusCode: 500,
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                "Access-Control-Expose-Headers": "*",
                "Access-Control-Allow-Origin": "*",
            },
            body: JSON.stringify({ error: "Internal error occurred while connecting socket" }),
        };
    }
};
