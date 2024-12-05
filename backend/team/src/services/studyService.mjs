import { dynamoDb, TEAM_TABLE } from "../utils/dynamoClient.mjs";
import { v4 as uuidv4 } from "uuid";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

export class StudyService {
    async createStudy(teamId, bookId, imgPath, studyData) {
        const decodedTeamId = decodeURIComponent(teamId);
        console.log('Decoded teamId:', decodedTeamId);  // 팀 ID 디코딩 후 로그
        const studyId = `STUDY#${uuidv4()}`;
        console.log('Generated studyId:', studyId);  // 생성된 studyId 로그

        const now = new Date().toISOString();
        console.log('Current timestamp (ISO format):', now);  // 현재 시간 로그

        const { studyInfo } = studyData;
        console.log('Study Info:', JSON.stringify(studyInfo));  // studyData에서 studyInfo 추출 후 로그

        const item = {
            PK: studyId,
            SK: studyId,
            itemType: 'Study',
            teamId: decodedTeamId,
            bookId,
            createdAt: now,
            updatedAt: now,
            imgPath,
            ...studyInfo,
        };
        console.log('Study item to be added:', JSON.stringify(item));  // DynamoDB에 저장할 항목 로그

        const studyUserIds = await this.getTeamUsers(decodedTeamId);
        console.log('Fetched studyUserIds:', studyUserIds);  // 팀 사용자 ID 목록 로그

        const getRoleAndState = (index) => {
            const role = index === 0 ? 'Manager' : 'Member';
            console.log(`Role for index ${index}:`, role);  // 사용자 역할 결정 후 로그
            return { role };
        };

        const addStudyUser = async () => {
            console.log('Adding study users to DynamoDB...');
            const memberPromises = studyUserIds.map(async (studyUserId, index) => {
                const { role } = getRoleAndState(index);
                console.log(`Adding user ${studyUserId} with role ${role} to the study...`);

                try {
                    await dynamoDb.send(new PutCommand({
                        TableName: TEAM_TABLE,
                        Item: {
                            PK: `${studyId}`,
                            SK: `${studyUserId}`,
                            itemType: 'StudyUser',
                            role,
                            createdAt: now,
                        },
                    }));
                    console.log(`User ${studyUserId} successfully added with role ${role}.`);
                } catch (error) {
                    console.error(`Error adding user ${studyUserId} to team ${decodedTeamId}:`, error);
                    return { userId: studyUserId, error };
                }
            });

            return memberPromises; // Promise 객체 배열을 반환
        };

        try {
            console.log('Saving study item to DynamoDB...');
            await dynamoDb.send(new PutCommand({ TableName: TEAM_TABLE, Item: item }));
            console.log('Study item saved successfully.');

            const memberPromises = await addStudyUser();
            const results = await Promise.all(memberPromises);

            const failedUsers = results.filter((result) => result?.error);
            console.log('Results of adding users:', results);
            if (failedUsers.length > 0) { 
                console.warn("Some users failed to be added:", failedUsers); 
            }

            return item;
        } catch (error) {
            console.error("Failed to create study page:", error);
            throw new Error("StudyCreateException");
        }
    }
    
    async getTeamUsers(teamId) {
        console.log('Fetching team users for teamId:', teamId);  // teamId 받아서 로그

        const params = {
            TableName: TEAM_TABLE,
            IndexName: 'PK-ItemType-Index',
            KeyConditionExpression: 'PK = :pk AND itemType = :itemType',
            ExpressionAttributeValues: {
                ':pk': teamId,
                ':itemType': 'TeamUser',
            }
        };

        try {
            console.log('Querying DynamoDB with params:', JSON.stringify(params));  // 쿼리 파라미터 로그
            const { Items } = await dynamoDb.send(new QueryCommand(params));
            console.log('Fetched Items:', JSON.stringify(Items));  // 반환된 항목 로그

            const userIds = Items.map((item) => item.SK);
            console.log('Mapped userIds:', userIds);  // 추출된 사용자 ID 목록 로그

            return userIds;
        } catch (error) {
            console.error("Failed to fetch team users:", error);
            throw new Error("TeamUserFetchException");
        }
    }

    async getStudyList(teamId) {
        const params = {
            TableName: TEAM_TABLE,
            IndexName: 'TeamId-ItemType-Index',
            KeyConditionExpression: 'teamId = :teamId AND itemType = :itemType',
            ExpressionAttributeValues: {
                ':teamId': decodeURIComponent(teamId),
                ':itemType': 'Study'
            }
        };

        try {
            const { Items } = await dynamoDb.send(new QueryCommand(params));
            return Items || [];
        } catch (error) {
            console.error("Failed to fetch study pages:", error);
            throw new Error("StudyPageFetchException");
        }
    }
}
