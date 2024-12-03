import { dynamoDb, TEAM_TABLE } from "../utils/dynamoClient.mjs";
import { v4 as uuidv4 } from "uuid";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

export class StudyService {
    async createStudy(teamId, bookId, studyData) {
        const decodedTeamId = decodeURIComponent(teamId);
        const studyPageId = `STUDY#${uuidv4()}`;
        const now = new Date().toISOString();
        const {studyInfo, studyUserIds} = studyData;

        const teamUsers = await this.getTeamUsers(decodedTeamId);
        const invalidUserIds = studyUserIds.filter((userId) => !teamUsers.includes(userId));
        console.log("Invalid users:", invalidUserIds);
        if (invalidUserIds.length > 0) {
            console.error(
                "Invalid users detected:",
                JSON.stringify({ decodedTeamId, studyUserIds, teamUsers, invalidUserIds }, null, 2)
            );
            throw new Error("InvalidUsersException");
        }    

        const item = {
            PK: studyPageId,
            SK: studyPageId,
            itemType: "StudyPage",
            teamId: decodedTeamId,
            bookId,
            createdAt: now,
            updatedAt: now,
            ...studyInfo,
        };
        try {
            await dynamoDb.send(new PutCommand({ TableName: TEAM_TABLE, Item: item, }));
            console.log(`Study page created with ID: ${studyPageId}`);

            const getRoleAndState = (index) => ({ role: index === 0 ? 'Manager' : 'Member' });
            
            const memberPromises = studyUserIds.map(async (studyUserId, index) => {
                const { role } = getRoleAndState(index);
                try {
                    return await dynamoDb.send(new PutCommand({
                        TableName: TEAM_TABLE,
                        Item: {
                            PK: `${decodedTeamId}`,
                            SK: `${studyUserId}`,
                            itemType: 'StudyUser',
                            role,
                            createdAt: now,
                        },
                    }));
                } catch (error) {
                    console.error(`Error adding user ${studyUserId} to team ${decodedTeamId}:`, error);
                    return { userId: studyUserId, error };
                }
            });
    
            const results = await Promise.all(memberPromises);
            const failedUsers = results.filter((result) => result?.error);

            if (failedUsers.length > 0) { console.warn("Some users failed to be added:", failedUsers); }

            return item;
        } catch (error) {
            console.error("Failed to create study page:", error);
            throw new Error("StudyCreateException");
        }
    }
    
    async getTeamUsers(teamId) {
        const params = {
            TableName: TEAM_TABLE,
            IndexName: 'PK-ItemType-Index',
            KeyConditionExpression: 'PK = :pk AND itemType = :itemType',
            ExpressionAttributeValues: {
                ':pk': teamId,
                ':itemType': 'TeamUser'
            }
        };

        try {
            const { Items } = await dynamoDb.send(new QueryCommand(params));
            return Items.map((item) => item.SK);
        } catch (error) {
            console.error("Failed to fetch team users:", error);
            throw new Error("TeamUserFetchException");
        }
    }
}
