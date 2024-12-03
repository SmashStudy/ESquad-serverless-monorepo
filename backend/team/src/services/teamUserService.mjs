import { QueryCommand, DeleteCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb, TEAM_TABLE } from '../utils/dynamoClient.mjs';
import { validateTeamUserIds, validateRoleCheckData } from '../utils/teamUserValidator.mjs';

/**
 * 한 유저가 소속된 모든 팀 조회 서비스
 */
export const getTeams = async (userEmail) => {

    // 1. SK가 userEmail 인 데이터 조회
    // SELECT PK, inviteState, itemType, createdAt
    const params = {
        TableName: TEAM_TABLE,
        IndexName: 'SK-ItemType-Index',
        KeyConditionExpression: 'SK = :sk and itemType = :itemType',
        ExpressionAttributeValues: {
            ':sk': userEmail,
            ':itemType': 'TeamUser'
        },
        ProjectionExpression: 'PK, inviteState, itemType', // 필요 항목만 조회
    };
    const result = await dynamoDb.send(new QueryCommand(params));
    console.log(`result: ${JSON.stringify(result)}`);

    let sortedTeams = null;

    if(result.Items.length > 0) {
        // 2. inviteState = 'complete' and itemType = 'TeamUser' 행 PK만 필터
        const filteredItems = result.Items.filter(
            (item) =>
                item.inviteState === 'complete'
        );

        if(filteredItems.length > 0) {
            // 3. teamName 조회
            const teamDetails = await Promise.all(
                filteredItems.map(async (item) => {
                    console.log(`item: ${JSON.stringify(item)}`);
                    const teamPK = item.PK;

                    // teamName 조회 쿼리
                    const teamParams = {
                        TableName: TEAM_TABLE,
                        KeyConditionExpression: 'PK = :pk',
                        FilterExpression: 'itemType = :itemType',
                        ExpressionAttributeValues: {
                            ':pk': teamPK,
                            ':itemType': 'Team',
                        },
                        ProjectionExpression: 'teamName, createdAt',
                    };

                    const teamResult = await dynamoDb.send(new QueryCommand(teamParams));
                    if (teamResult.Items.length > 0) {
                        const team = teamResult.Items[0];
                        return {
                            PK: teamPK,
                            teamName: team.teamName,
                            createdAt: team.createdAt,
                        };
                    }
                    return null; // Return null if no teamName found
                })
            );

            // 4. 내림차순 정렬
            sortedTeams = teamDetails
                .filter((team) => team !== null) // Remove null entries
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); // Sort by createdAt
        }
    }
    // Print results
    console.log('Teams:', sortedTeams);
    return sortedTeams;
};

/**
 * 팀 유저 권한 확인 서비스
 */
export const checkTeamUserRole = async (teamId, userEmail) => {

    const roleCheckValidation = validateRoleCheckData(teamId, userEmail);
    if (!roleCheckValidation.isValid) throw new Error(roleCheckValidation.message);

    const teamUserParams = {
        TableName: TEAM_TABLE,
        KeyConditionExpression: 'PK = :pk AND SK = :sk',
        ExpressionAttributeValues: {
            ':pk': teamId,
            ':sk': userEmail
        }
    };
    const teamUserResult = await dynamoDb.send(new QueryCommand(teamUserParams));
    const teamUser = teamUserResult.Items?.[0];
    // console.dir(teamUser);

    if (!teamUser) {
        throw new Error('User does not have manager permissions');
    }
    return userEmail;
};

/**
 * 팀 유저 정보 조회 서비스
 */
export const getTeamUsersProfile = async (teamId) => {
    // DynamoDB 쿼리 구성
    const teamUserParams = {
        TableName: TEAM_TABLE,
        IndexName: 'PK-ItemType-Index', // 인덱스가 있는 경우 사용
        KeyConditionExpression: 'PK = :pk AND itemType = :itemType',
        ExpressionAttributeValues: {
            ':pk': teamId,
            ':itemType': 'TeamUser'
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

    const memberPromises = userIds.map((userId) => {
        return dynamoDb.send(new PutCommand({
            TableName: TEAM_TABLE,
            Item: {
                PK: teamId,
                SK: userId,
                itemType: 'TeamUser',
                role: 'Member',
                inviteState: 'processing',
                createdAt: new Date().toISOString()
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
    });

    await Promise.all(deletePromises);
    return { deletedUsers: userIds };
};