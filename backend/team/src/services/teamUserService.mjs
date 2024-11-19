import { QueryCommand, GetCommand, DeleteCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb, TEAM_TABLE } from '../utils/dynamoClient.mjs';
import { validateTeamUserIds, validateRoleCheckData } from '../utils/teamUserValidator.mjs';

/**
 * 한 유저가 소속된 모든 팀 조회 서비스
 */
export const getTeams = async (userId) => {
    const params = {
        TableName: TEAM_TABLE,
        IndexName: 'SK-Index',
        KeyConditionExpression: 'SK = :sk',
        FilterExpression: 'itemType = :itemType',
        ExpressionAttributeValues: {
            ':sk': userId,
            ':itemType': 'TeamSpaceUser'
        }
    };
    const result = await dynamoDb.send(new QueryCommand(params));
    return result.Items || [];
};

/**
 * 팀 유저 권한 확인 서비스
 */
export const checkTeamUserRole = async (teamId, userId) => {

    const roleCheckValidation = validateRoleCheckData(teamId, userId);
    if (!roleCheckValidation.isValid) throw new Error(roleCheckValidation.message);

    const teamUserParams = {
        TableName: TEAM_TABLE,
        KeyConditionExpression: 'PK = :pk AND SK = :sk',
        ExpressionAttributeValues: {
            ':pk': teamId,
            ':sk': userId,
        },
    };
    const teamUserResult = await dynamoDb.send(new QueryCommand(teamUserParams));
    const teamUser = teamUserResult.Items?.[0];

    if (!teamUser || teamUser.role !== 'Manager') {
        throw new Error('User does not have manager permissions');
    }
    return true;
};

/**
 * 팀 유저 정보 조회 서비스
 */
export const getTeamUsersProfile = async (teamId) => {
    // DynamoDB 쿼리 구성
    const teamUserParams = {
        TableName: TEAM_TABLE,
        IndexName: 'ItemType-Index', // 인덱스가 있는 경우 사용
        KeyConditionExpression: 'PK = :pk AND itemType = :itemType',
        ExpressionAttributeValues: {
            ':pk': teamId,
            ':itemType': 'TeamSpaceUser'
        }
    };

    // DynamoDB에서 팀유저 정보 조회
    const teamUserResult = await dynamoDb.send(new QueryCommand(teamUserParams));

    // 조회된 팀 유저 데이터 가져오기
    const teamUserItems = teamUserResult.Items;

    if (!teamUserItems || teamUserItems.length === 0) {
        throw new Error('teamUser not found');
    }

    // 팀 내 모든 크루 정보 반환
    return teamUserItems;
}

/**
 * 팀에 멤버 추가 서비스
 */
export const addTeamUsers= async (teamId, userIds) => {
    
    const validation = validateTeamUserIds(teamId, userIds);
    if (!validation.isValid) throw new Error(validation.message);

    const memberPromises = userIds.map((userId, index) => {
        const role = index === 0 ? 'Manager' : 'Member';

        return dynamoDb.send(new PutCommand({
            TableName: TEAM_TABLE,
            Item: {
                PK: teamId,
                SK: userId,
                itemType: 'TeamSpaceUser',
                role: role
            },
        }));
    });

    await Promise.all(memberPromises);
};

/**
 * 팀에서 특정 유저들을 삭제하는 서비스
 * - 팀 ID와 삭제할 유저 ID 목록을 받아 해당 유저들을 DynamoDB에서 삭제
 */
export const deleteTeamUsers = async (teamId, userIds) => {
    const deletePromises = userIds.map(async (userId) => {
        const params = {
            TableName: TEAM_TABLE,
            Key: {
                PK: teamId,
                SK: userId
            }
        };
        await dynamoDb.send(new DeleteCommand(params));
        console.log(`Deleted user ${userId} from team ${teamId}`);
    });

    await Promise.all(deletePromises);
    return { deletedUsers: userIds };
};