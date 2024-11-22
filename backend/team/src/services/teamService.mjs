import { v4 as uuidv4 } from 'uuid';
import { QueryCommand, GetCommand, UpdateCommand, DeleteCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb, TEAM_TABLE } from '../utils/dynamoClient.mjs';
import { validateTeamName, validateTeamDescription } from '../utils/teamValidator.mjs';
import * as TeamUserService from '../services/teamUserService.mjs';

/**
 * 팀 이름 중복 확인 서비스
 */
export const checkTeamName = async (teamName) => {
    const params = {
        TableName: TEAM_TABLE,
        IndexName: 'TeamName-Index',
        KeyConditionExpression: 'teamName = :teamName',
        ExpressionAttributeValues: { ':teamName': teamName },
    };
    const result = await dynamoDb.send(new QueryCommand(params));
    return result.Items.length === 0;
};

/**
 * 팀 생성 서비스
 */
export const createTeam = async ({ teamName, description, userIds }) => {
    
    const nameValidation = validateTeamName(teamName);
    if (!nameValidation.isValid) {
        throw new Error(nameValidation.message);
    }

    const descriptionValidation = validateTeamDescription(description);
    if (!descriptionValidation.isValid) {
        throw new Error(descriptionValidation.message);
    }

    const teamId = `TEAM#${uuidv4()}`;
    const teamParams = {
        TableName: TEAM_TABLE,
        Item: {
            PK: teamId,
            SK: teamId,
            itemType: 'Team',
            teamName,
            description,
            creatAt: new Date().toISOString(),
            updateAt: new Date().toISOString(),
        },
    };
    await dynamoDb.send(new PutCommand(teamParams));

    if (userIds.length < 4 || userIds.length > 12) {
        return { isValid: false, message: '팀 구성원은 최소 4명, 최대 12명이어야 합니다.' };
    }

    await TeamUserService.addTeamUsers(teamId, userIds);
    
    return { teamId, teamName };
};

/**
 * 팀 프로필 조회 서비스
 */
export const getTeamProfile = async (teamId) => {
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
 */
export const updateTeam = async (teamId, { teamName, description }) => {
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
            ':description': description,
        },
        ReturnValues: 'ALL_NEW',
    };
    const result = await dynamoDb.send(new UpdateCommand(params));
    return result.Attributes;
};

/**
 * 팀 삭제 서비스
 */
export const deleteTeam = async (teamId) => {
    const queryParams = {
        TableName: TEAM_TABLE,
        KeyConditionExpression: 'PK = :pk',
        ExpressionAttributeValues: {':pk': teamId },
    };

    const queryResult = await dynamoDb.send(new QueryCommand(queryParams));
    
    const deletePromises = queryResult.Items.map(item =>
        dynamoDb.send(new DeleteCommand({ 
            TableName: TEAM_TABLE, 
            Key: { PK: item.PK, SK: item.SK } 
        }))
    );
    
    await Promise.all(deletePromises);
};