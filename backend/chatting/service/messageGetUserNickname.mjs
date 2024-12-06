import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({ region: process.env.CHATTING_REGION });
const docClient = DynamoDBDocumentClient.from(client);

const MESSAGE_TABLE = process.env.MESSAGE_TABLE_NAME;

export const handler = async (event) => {
    console.log('DynamoDB Stream event:', JSON.stringify(event, null, 2));
    for (const record of event.Records) {
        if (record.eventName === "MODIFY") {
            const newImage = record.dynamodb.NewImage;
            const oldImage = record.dynamodb.OldImage;

            // 닉네임이 변경된 경우에만 처리하기
            if (newImage.nickname &&
                oldImage.nickname &&
                newImage.nickname.S !== oldImage.nickname.S)
            {
                const updatedNickname = newImage.nickname.S;
                const userEmail = newImage.email.S;

                try {
                    const scanParams = {
                        TableName: MESSAGE_TABLE,
                        FilterExpression: "user_id = :userEmail",
                        ExpressionAttributeValues: {
                            ":userEmail": userEmail,
                        },
                    };
                    const data = await docClient.send(new ScanCommand(scanParams));
                    // 관련 메시지가 있으면 닉네임 업데이트
                    if (data.Items.length && data.Items.length > 0) {
                        console.log(`Found ${data.Items.length} messages to update for user: ${userEmail}`);

                        await Promise.all(
                            data.Items.map(async (item) => {
                                const updateParams = {
                                    TableName: MESSAGE_TABLE,
                                    Key: {
                                        room_id: item.room_id,
                                        timestamp: Number(item.timestamp)
                                    },
                                    UpdateExpression: "SET nickname = :updatedNickname",
                                    ExpressionAttributeNames: {
                                        "#ts": "timestamp", // `timestamp` 예약어 대체
                                    },
                                    ExpressionAttributeValues: {
                                        ":updatedNickname": updatedNickname,
                                    },
                                    ConditionExpression: "attribute_exists(#ts)", // `timestamp`를 플레이스홀더로 사용
                                };
                                try {
                                    await docClient.send(new UpdateCommand(updateParams));
                                    console.log(`Updated nickname for message at timestamp ${item.timestamp} to ${updatedNickname}`);
                                } catch (updateError) {
                                    console.error(`Failed to update message at timestamp ${item.timestamp}:`, updateError.message);
                                }
                            })
                        );
                    } else {
                        console.log(`No messages found for user: ${userEmail}`);
                    }
                } catch (scanError) {
                    console.error(`Failed to scan messages for user ${userEmail}:`, scanError.message);
                }
            }
        }
        return {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Origin': `${process.env.ALLOWED_ORIGIN}`,
                "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            body: JSON.stringify({ status: "completed" }),
        };
    }
}