import { dynamoDb, TEAM_TABLE } from "../utils/dynamoClient.mjs";
import { v4 as uuidv4 } from "uuid";

const { QueryCommand, PutCommand } = dynamoDb;
export class StudyService {
    async createStudy(teamId, bookId, studyData) {
        const studyPageId = `STUDY#${uuidv4()}`;
        const now = new Date().toISOString();
        const {studyInfo, studyUserIds} = studyData;

        const teamUsers = await this.getTeamUsers(teamId);
        const invalidUsers = studyUserIds.filter((userId) => !teamUsers.includes(userId));

        if (invalidUsers.length > 0) {
            console.error(`Invalid users detected: ${invalidUsers.join(", ")}`);
            throw new Error("InvalidUsersException");
        }


        const item = {
            PK: `TEAM#${teamId}`,
            SK: studyPageId,
            itemType: "StudyPage",
            teamId,
            bookId,
            createdAt: now,
            updatedAt: now,
            ...studyInfo,
        };

        const command = new PutCommand({
            TableName: TEAM_TABLE,
            Item: item,
        });

        try {
            await dynamoDb.send(command);
            console.log(`Study page created with ID: ${studyPageId}`);

            const getRoleAndState = (index) => ({
                role: index === 0 ? 'Manager' : 'Member'
            });
            
            const memberPromises = studyUserIds.map(async (studyUserId, index) => {
                const { role } = getRoleAndState(index);
                try {
                    return await dynamoDb.send(new PutCommand({
                        TableName: TEAM_TABLE,
                        Item: {
                            PK: `TEAM#${teamId}`,
                            SK: `USER#${studyUserId}`,
                            itemType: 'StudyUser',
                            role,
                            createdAt: now,
                        },
                    }));
                } catch (error) {
                    console.error(`Error adding user ${studyUserId} to team ${teamId}:`, error);
                }
            });
    
            const results = await Promise.all(memberPromises);
            const failedUsers = results.filter((result) => result?.error);

            if (failedUsers.length) {
                console.warn("Some users failed to be added:", failedUsers);
            }

            return item;
        } catch (error) {
        console.error("Failed to create study page:", error);
        throw new Error("StudyCreateException");
        }
    }
    
    async getTeamUsers(teamId) {
        const params = {
            TableName: TEAM_TABLE,
            KeyConditionExpression: "PK = :teamId AND begins_with(SK, :userPrefix)",
            ExpressionAttributeValues: {
                ":teamId": `TEAM#${teamId}`,
                ":userPrefix": "USER#",
            },
        };

        try {
            const { Items } = await dynamoDb.send(new QueryCommand(params));
            return Items.map((item) => item.SK.split("#")[1]); // USER#ID에서 ID 추출
        } catch (error) {
            console.error("Failed to fetch team users:", error);
            throw new Error("TeamUserFetchException");
        }
    }
}
