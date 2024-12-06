import { dynamoDb, TEAM_TABLE } from "../utils/dynamoClient.mjs";
import { v4 as uuidv4 } from "uuid";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

export class StudyService {

  /**
   * 스터디 생성 서비스
   */
  async createStudy(teamId, bookId, imgPath, studyData) {
    const decodedTeamId = decodeURIComponent(teamId);
    const studyId = `STUDY#${uuidv4()}`;
    const now = new Date().toISOString();
    const { studyInfo } = studyData;
    const studyUserIds = await this.getTeamUsers(decodedTeamId);
    const item = {
      PK: studyId,
      SK: studyId,
      itemType: 'Study',
      teamId: decodedTeamId,
      bookId,
      createdAt: now,
      updatedAt: now,
      imgPath,
      studyName: studyInfo.studyName,
      startDate: studyInfo.startDate,
      endDate: studyInfo.endDate,
      description: studyInfo.description
    };

    const getRoleAndState = (index) => {
      const role = index === 0 ? 'Manager' : 'Member';
      return { role };
    };

    const addStudyUser = async () => {
      const memberPromises = studyUserIds.map(async (studyUserId, index) => {
        const { role } = getRoleAndState(index);

        try {
          await dynamoDb.send(new PutCommand({
            TableName: TEAM_TABLE,
            Item: {
              PK: studyId,
              SK: studyUserId,
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

      return memberPromises;
    };

    try {
      await dynamoDb.send(new PutCommand({ TableName: TEAM_TABLE, Item: item }));

      const memberPromises = await addStudyUser();
      const results = await Promise.all(memberPromises);
      const failedUsers = results.filter((result) => result?.error);
      if (failedUsers.length > 0) {
        console.warn("Some users failed to be added:", failedUsers);
      }

      return item;
    } catch (error) {
      console.error("Failed to create study :", error);
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
        ':itemType': 'TeamUser',
      }
    };

    try {
      const { Items } = await dynamoDb.send(new QueryCommand(params));
      const userIds = Items.map((item) => item.SK);
      return userIds;
    } catch (error) {
      console.error("Failed to fetch team users:", error);
      throw new Error("TeamUserFetchException");
    }
  }

  /**
   * 스터디 조회 서비스
   */
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
      console.error("Failed to fetch study s:", error);
      throw new Error("StudyFetchException");
    }
  }
}
