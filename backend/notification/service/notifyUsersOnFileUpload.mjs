import { DynamoDBClient, QueryCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({ region: process.env.AWS_REGION });
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });

const TEAM_TABLE = process.env.TEAM_TABLE;
const NOTIFICATIONS_TABLE = process.env.NOTIFICATIONS_TABLE;

export const handler = async (event) => {
    try {
        console.log("Received DynamoDB Stream Event:", JSON.stringify(event));

        for (const record of event.Records) {
            const eventName = record.eventName;     // INSERT, MODIFY, REMOVE
            if (!["INSERT", "REMOVE"].includes(eventName)) {
                continue; // INSERT 및 REMOVE 이벤트만 처리
            }

            const newImage = record.dynamodb.NewImage;
            const action = record.eventName === "INSERT" ? "uploaded" : "deleted";

            if (!newImage || newImage.targetType.S !== "STUDY_PAGE") {
                continue; // targetType이 STUDY_PAGE가 아니면 무시
            }

            const userId = newImage.userId.S;
            const targetId = newImage.targetId.S;
            const fileName = newImage.originalFileName.S;

            // 1. StudyPage 정보 가져오기 ( 유저ID 및 studyPageName)
            const teamQueryCommand = new QueryCommand({
                TableName: process.env.TEAM_TABLE_NAME,
                KeyConditionExpression: "PK = :pk",
                ExpressionAttributeValues: {
                    ":pk": { S: targetId },
                },
            });

            const teamResponse = await dynamoDbClient.send(teamQueryCommand);
            console.log(teamResponse.Items);

            if (!teamResponse.Items || teamResponse.Items.length === 0) {
                console.error(`No team members found for study page: ${targetId}`);
                continue;
            }

            // 2. 스터디페이지명과 유저정보 분리
            const studyPageName = teamResponse.Items.find((item) => item.itemType.S === "StudyPage")?.StudyPageName.S;
            const users = teamResponse.Items.filter((item) => item.itemType.S === "StudyPageUser").map((item) => item.SK.S);

            // 3. 알림 메시지 생성
            const message = `${userId} 가 파일 "${fileName}" 을 "${studyPageName}" 스터디에 공유했습니다.`;

            // 3. 알림 저장 및 SNS 전송
            for (const user of users) {
                const notificationItem = {
                    PK: { S: `NOTIFICATION#${Date.now()}` },
                    SK: { S: `USER#${user.split("#")[1]}` },
                    message: { S: message },
                    isRead: { BOOL: false },
                    createdAt: { S: new Date().toISOString() },
                };

                // DynamoDB에 알림 저장
                await dynamoDbClient.send(new PutItemCommand({ TableName: process.env.NOTIFICATIONS_TABLE_NAME, Item: notificationItem }));
            }

            // 4. SNS를 통해 알림 전송
            const publishCommand = new PublishCommand({
                TopicArn: `arn:aws:sns:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:${process.env.SNS_TOPIC_PREFIX}`,
                Message: message,
            });

            await snsClient.send(publishCommand);
            console.log(`Notification sent to ${users}: ${message}`);
        }

        return { statusCode: 200, body: JSON.stringify({ message: "Notifications processed successfully!" }) };
    } catch (error) {
        console.error("Error processing DynamoDB Stream Event:", error);
        return { statusCode: 500, body: JSON.stringify({ message: "Error processing event", error: error.message }) };
    }
};