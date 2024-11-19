import { DynamoDBClient, QueryCommand, BatchGetItemCommand, BatchWriteItemCommand} from "@aws-sdk/client-dynamodb";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
// import { sendNotificationHandler } from "./sendNotifications.mjs";

// const snsClient = new SNSClient({ region: process.env.AWS_REGION });
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });

const TEAM_TABLE = process.env.TEAM_DYNAMODB_TABLE;
const NOTIFICATION_TABLE = process.env.NOTIFICATION_DYNAMODB_TABLE;
const CONNECTIONS_TABLE_NAME = process.env.NOTIFICATION_CONNECTIONS_DYNAMODB_TABLE;
const NOTIFICATION_CONNECTION_USER_INDEX = process.env.NOTIFICATION_WEBSOCKET_CONNECTION_USER_INDEX;

const apiGatewayClient = new ApiGatewayManagementApiClient({
    endpoint: process.env.SOCKET_API_ENDPOINT, // 환경 변수로 설정된 웹소켓 엔드포인트
});

// 사용자 ID 목록으로 연결 ID 가져오기 (DynamoDB 조회)
const getConnectionIdsByUserIds = async (userIds) => {
    try {
        if (!userIds || userIds.length === 0) {
            console.warn("No user IDs provided.");
            return [];
        }

        const results = await Promise.all(
            userIds.map(async (userId) => {
                const params = {
                    TableName: CONNECTIONS_TABLE_NAME,
                    IndexName: 'UserIdIndex',
                    KeyConditionExpression:'#userId = :userId',     // GSI의 파티션 키(userId)와 비교하는 조건식
                    ExpressionAttributeNames: {
                        '#userId': 'userId',                        // 'userId'라는 실제 필드명을 매핑
                    },
                    ExpressionAttributeValues: {                    // KeyConditionExpression에서 사용하는 값 정의
                        ':userId': { S: userId },
                    },
                    ProjectionExpression: 'connectionId',           // 결과에서 반환할 속성을 지정 (connectionId만 반환)
                };

                try {
                    const command = new QueryCommand(params);
                    const result = await dynamoClient.send(command);
                    console.log(`Notification Connection Table result: ${result.Items}`);

                    if (result.Items && result.Items.length > 0) {
                        return result.Items.map((item) => item.connectionId.S); // DynamoDB 값 타입 처리
                    } else {
                        console.warn(`No connections found for userId: ${userId}`);
                        return [];
                    }
                } catch (queryError) {
                    console.error(`Error querying connection IDs for userId ${userId}:`, queryError);
                    return [];
                }
            })
        );

        // 2차원 배열을 평탄화하여 1차원 배열 반환
        return results.flat();
    } catch (error) {
        console.error("Error fetching connection IDs:", error);
        return [];
    }
};

const sendWebSocketMessage = async (connectionId, message) => {
    try {
        const params = {
            ConnectionId: connectionId,
            Data: JSON.stringify({ message }),
        };
        const command = new PostToConnectionCommand(params);
        await apiGatewayClient.send(command);
        console.log(`Message sent to connection: ${connectionId}`);
    } catch (error) {
        if (error.name === 'GoneException' || error.code === 'ForbiddenException') {
            console.error(`Connection ${connectionId} is gone, deleting from DynamoDB`);
            await dynamoClient.send(
                new DeleteCommand({
                    TableName: CONNECTIONS_TABLE_NAME,
                    Key: { connectionId },
                })
            );
        } else {
            console.error(`Failed to send message to connection ${connectionId}:`, error);
        }
    }
};


export const handler = async (event) => {
    try {
        console.log("Received DynamoDB Stream Event:", JSON.stringify(event));

        for (const record of event.Records) {
            if (!["INSERT", "REMOVE"].includes(record.eventName)) {
                continue; // INSERT 및 REMOVE 이벤트만 처리
            }

            if (record.eventName === "INSERT") {
                const newImage = record.dynamodb.NewImage;
                if (!newImage || newImage.targetType.S !== "STUDY_PAGE") {
                    continue; // targetType이 STUDY_PAGE가 아니면 무시
                }

                try {
                    // 삽입된 항목에서 사용자 ID를 추출
                    const userId = newImage.userId.S;
                    const targetId = newImage.targetId.S;
                    const fileName = newImage.originalFileName.S;

                    // 1. StudyPage 정보 가져오기 ( 유저ID 및 studyPageName)
                    const teamQueryCommand = new QueryCommand({
                        TableName: TEAM_TABLE,
                        KeyConditionExpression: "PK = :pk",
                        ExpressionAttributeValues: {
                            ":pk": { S: targetId },
                        },
                    });

                    const teamResponse = await dynamoClient.send(teamQueryCommand);
                    console.log(`TeamTable Items: ${teamResponse.Items}`);

                    if (!teamResponse.Items || teamResponse.Items.length === 0) {
                        console.error(`No team members found for study page: ${targetId}`);
                        continue;
                    }

                    // 2. 스터디페이지명과 유저정보 분리
                    const studyName = teamResponse.Items.find((item) => item.itemType.S === "Study")?.studyName.S;
                    const users = teamResponse.Items.filter((item) => item.itemType.S === "StudyUser").map((item) => item.SK.S);

                    // 3. 알림 메시지 생성
                    const message = `${userId} 가 파일 "${fileName}" 을 "${studyName}" 스터디에 공유했습니다.`;

                    // 3. 알림 저장
                    const writeRequests = users.map((user) => ({
                        PutRequest: {
                            Item: {
                                id: { S: `NOTIFICATION#${Date.now()}` },
                                userId: { S: user },
                                message: { S: message },
                                sender: { S: studyName },
                                isRead: { N: "0" },
                                createdAt: { S: new Date().toISOString() },
                            },
                        },
                    }));

                    // BatchWriteItemCommand로 요청 준비 (여러 개의 요청을 한 번에 처리)
                    const params = {
                        RequestItems: {
                            [NOTIFICATION_TABLE]: writeRequests,
                        },
                    };

                    await dynamoClient.send(new BatchWriteItemCommand(params));
                    console.log("Notifications written successfully.");

                    // 4. 사용자ID 로 연결ID 가져오기
                    const connectionIds = await getConnectionIdsByUserIds(users);

                    // 5. 연결된 클라이언트에게 메시지 전송
                    if (connectionIds.length > 0) {
                        for (const connectionId of connectionIds) {
                            await sendWebSocketMessage(connectionId, message);
                        }
                    }
                } catch (error) {
                    console.error("Error processing record: ", error);
                }
            }
        }









        // 4. SNS 에 메시지 게시 ( pub )
        // for (const user of users) {
        //     const publishCommand = new PublishCommand({
        //         TopicArn: `arn:aws:sns:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:${process.env.SNS_TOPIC_PREFIX}`,
        //         Message: message,
        //         // Sender: studyName,
        //         MessageAttributes: {
        //             userId: {
        //                 DataType: "String",
        //                 StringValue: user,        // Target UserId
        //             },
        //         }
        //     });
        //
        //     await snsClient.send(publishCommand);
        //     console.log(`Notification sent to ${user}`);
        // }

        // }

        return { statusCode: 200, body: JSON.stringify({ message: "Notifications processed successfully!" }) };
    } catch (error) {
        console.error("Error processing DynamoDB Stream Event:", error);
        return { statusCode: 500, body: JSON.stringify({ message: "Error processing event", error: error.message }) };
    }
};