import { DynamoDBClient, GetItemCommand } from "@aws-sdk/client-dynamodb";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";

const snsClient = new SNSClient({ region: process.env.AWS_REGION });
const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });

const USERS_TABLE = process.env.USERS_TABLE;
const SNS_TOPIC_PREFIX = process.env.SNS_TOPIC_PREFIX;

export const handler = async (event) => {
    try {
        console.log("DynamoDB Stream Event:", JSON.stringify(event));

        for (const record of event.Records) {
            if (record.eventName === "INSERT" || record.eventName === "REMOVE") {
                const teamId = record.dynamodb.Keys.teamId.S;
                const action = record.eventName === "INSERT" ? "created" : "deleted";
                const fileId = record.dynamodb.Keys.id.S;

                console.log(`File ${action} for team ${teamId}: File ID - ${fileId}`);

                // Fetch all team members
                const teamMembersResponse = await dynamoClient.send(
                    new GetItemCommand({
                        TableName: USERS_TABLE,
                        Key: {
                            teamId: { S: teamId },
                        },
                    })
                );

                if (!teamMembersResponse.Item) {
                    console.error(`No team members found for teamId: ${teamId}`);
                    continue;
                }

                const teamMembers = teamMembersResponse.Item.members.L.map(
                    (member) => member.M
                );

                // Notify each team member
                const message = `A file has been ${action} in team ${teamId}: File ID - ${fileId}`;
                const topicArn = `arn:aws:sns:${process.env.AWS_REGION}:${process.env.AWS_ACCOUNT_ID}:${SNS_TOPIC_PREFIX}-${teamId}`;

                await snsClient.send(
                    new PublishCommand({
                        TopicArn: topicArn,
                        Message: message,
                    })
                );

                console.log(`Notification sent to team: ${teamId}`);
            }
        }

        return { statusCode: 200, body: "Notifications processed successfully" };
    } catch (error) {
        console.error("Error processing DynamoDB Stream event:", error);
        return { statusCode: 500, body: "Error processing DynamoDB Stream event" };
    }
};