// 팀 서비스 로직
import { v4 as uuidv4 } from 'uuid';
import { QueryCommand, GetCommand, UpdateCommand, DeleteCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

import { dynamoDb, TEAM_TABLE } from '../utils/dynamoClient.mjs';
import { validateTeamName, validateTeamMembers } from '../utils/teamValidator.mjs';


/**
 * 팀 생성 서비스
 * - 팀을 생성하고, 팀장 및 멤버로 구성된 항목을 DynamoDB에 저장
 */
export const createTeamService = async ({ teamName, description, userIds }) => {

    // 팀 이름 유효성 검사
    const nameValidation = validateTeamName(teamName);
    if (!nameValidation.isValid) {
        throw new Error(nameValidation.message);
    }

    // 팀 멤버 유효성 검사
    const memberValidation = validateTeamMembers(userIds);
    if (!memberValidation.isValid) {
        throw new Error(memberValidation.message);
    }

    const teamId = `TEAM#${uuidv4()}`;
    const teamParams = {
        TableName: TEAM_TABLE,
        Item: {
            PK: teamId,
            SK: teamId,
            itemType: 'TeamSpace',
            teamName,
            description,
        },
    };

    await dynamoDb.send(new PutCommand(teamParams));

    const memberPromises = userIds.map((userId, index) => {
        const role = index === 0 ? 'Manager' : 'Member';
        return dynamoDb.send(new PutCommand({
            TableName: TEAM_TABLE,
            Item: {
                PK: teamId,
                SK: userId,
                itemType: 'TeamSpaceUser',
                role,
            },
        }));
    });

    await Promise.all(memberPromises);
    return { teamId, teamName };
};

/**
 * 팀 이름 중복 확인 서비스
 * - 이미 존재하는 팀 이름인지 확인
 */ 
export const checkTeamNameService = async (teamName) => {
    const params = {
        TableName: TEAM_TABLE,
        IndexName: 'TeamNameIndex',
        KeyConditionExpression: 'teamName = :teamName',
        ExpressionAttributeValues: { ':teamName': teamName },
    };
    const result = await dynamoDb.send(new QueryCommand(params));
    return result.Items.length === 0;
};

/**
 * 유저가 소속된 모든 팀 조회 서비스
 */
export const getAllTeamsService = async (userId) => {
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
 * 팀 프로필 조회 서비스
 */
export const getTeamProfileService = async (teamId) => {
    const params = {
        TableName: TEAM_TABLE,
        Key: { PK: teamId, SK: teamId }
    };
    const result = await dynamoDb.send(new GetCommand(params));
    if (!result.Item) throw new Error('Team not found');
    return result.Item;
};

/**
 * 팀 수정 서비스
 * - 팀 이름과 설명을 수정
 */
export const updateTeamService = async (teamId, { teamName, description }) => {
    const nameValidation = validateTeamName(teamName);
    if (!nameValidation.isValid) {
        throw new Error(nameValidation.message);
    }
    
    const params = {
        TableName: TEAM_TABLE,
        Key: { PK: teamId, SK: teamId },
        UpdateExpression: 'SET teamName = :teamName, description = :description',
        ExpressionAttributeValues: {
            ':teamName': teamName,
            ':description': description
        },
        ReturnValues: 'ALL_NEW'
    };
    const result = await dynamoDb.send(new UpdateCommand(params));
    return result.Attributes;
};

/**
 * 팀 삭제 서비스
 * - 팀과 관련된 모든 항목을 삭제
 */
export const deleteTeamService = async (teamId) => {
    const queryParams = {
        TableName: TEAM_TABLE,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: { ':pk': teamId }
    };

    const relatedItemsParams = {
        TableName: TEAM_TABLE,
        IndexName: 'teamID-Index',
        KeyConditionExpression: 'teamID = :teamID',
        ExpressionAttributeValues: { ':teamID': teamId }
    };

    const queryResult = await dynamoDb.send(new QueryCommand(queryParams));
    const relatedItemsResult = await dynamoDb.send(new QueryCommand(relatedItemsParams));

    const deletePromises = [
        ...queryResult.Items.map(item => dynamoDb.send(new DeleteCommand({ TableName: TEAM_TABLE, Key: { PK: item.PK, SK: item.SK } }))),
        ...relatedItemsResult.Items.map(item => dynamoDb.send(new DeleteCommand({ TableName: TEAM_TABLE, Key: { PK: item.PK, SK: item.SK } })))
    ];

    await Promise.all(deletePromises);
};