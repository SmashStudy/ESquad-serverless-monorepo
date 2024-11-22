import { BatchWriteItemCommand, DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from 'uuid';
// import { sendNotificationHandler } from "./fetch.mjs";

// const snsClient = new SNSClient({ region: process.env.AWS_REGION });
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });

const TEAM_TABLE = process.env.TEAM_DYNAMODB_TABLE;
const NOTIFICATION_TABLE = process.env.NOTIFICATION_DYNAMODB_TABLE;
const CONNECTIONS_TABLE_NAME = process.env.NOTIFICATION_CONNECTIONS_DYNAMODB_TABLE;
const NOTIFICATION_CONNECTION_USER_INDEX = process.env.NOTIFICATION_WEBSOCKET_CONNECTION_USER_INDEX;
const ENDPOINT = `https://yzm1bdqqw8.execute-api.${process.env.AWS_REGION}.amazonaws.com/dev`;

const MAX_BATCH_SIZE = 25;

const saveNotifications = async (users, message, studyName) => {
    try {
        // Chunk users to ensure batch size limit of 25 items per request
        for (let i = 0; i < users.length; i += MAX_BATCH_SIZE) {
            const chunk = users.slice(i, i + MAX_BATCH_SIZE);
            const writeRequests = chunk.map((user) => ({
                PutRequest: {
                    Item: {
                        id: { S: `${uuidv4()}` },
                        userId: { S: user },
                        message: { S: message },
                        sender: { S: studyName },
                        isRead: { N: "0" }, // Corrected the format to string "0"
                        isSave: { N: '0'},
                        createdAt: { S: new Date().toISOString() },
                    },
                },
            }));

            // Prepare BatchWriteItemCommand parameters
            const params = {
                RequestItems: {
                    [NOTIFICATION_TABLE]: writeRequests,
                },
            };

            // Send BatchWriteItemCommand and handle retries for unprocessed items
            let unprocessedItems = params.RequestItems;
            while (Object.keys(unprocessedItems).length > 0) {
                const command = new BatchWriteItemCommand({ RequestItems: unprocessedItems });
                const response = await dynamoClient.send(command);

                if (response.UnprocessedItems && Object.keys(response.UnprocessedItems).length > 0) {
                    console.warn("Retrying unprocessed items:", response.UnprocessedItems);
                    unprocessedItems = response.UnprocessedItems;
                } else {
                    unprocessedItems = {};
                }
            }

            console.log("Chunk of notifications written successfully.");
        }
    } catch (error) {
        console.error("Error saving notifications:", error);
        throw new Error("Error saving notifications");
    }
};

export const handler = async (event) => {
    try {
        console.log("Received DynamoDB Stream Event:", JSON.stringify(event));

        for (const record of event.Records) {
            if (!["INSERT"].includes(record.eventName)) {
                continue; // INSERT 및 REMOVE 이벤트만 처리
            }

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
                console.log(`TeamTable Items: ${JSON.stringify(teamResponse.Items)}`);

                // 2. 스터디페이지명과 유저정보 분리
                const studyName = teamResponse.Items.find((item) => item.itemType.S === "Study")?.studyName.S;
                const users = teamResponse.Items
                    .filter((item) => item.itemType?.S === "StudyUser")
                    .map((item) => item.SK?.S)
                    .filter(Boolean);

                if (!studyName || users.length === 0) {
                    console.warn("Study name or users not found, skipping notification.");
                    continue;
                }

                // 3. 알림 메시지 생성
                const message = `${userId} 가 파일 ${fileName} 을 ${studyName} 스터디에 공유했습니다.`;
                console.log(`message: ${message}`);

                // 3. 알림 저장
                await saveNotifications(users, message, studyName);
                console.log("Notifications written successfully.");
                
                return {
                    statusCode: 200,
                };
            } catch (error) {
                return {
                    statusCode: 500,
                    body: JSON.stringify({ message: "Error processing event", error: error.message }),
                };
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
    } catch (error) {
        console.error("Error processing DynamoDB Stream Event:", error);
        return { statusCode: 500, body: JSON.stringify({ message: "Error processing event", error: error.message }) };
    }
};