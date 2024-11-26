import { v4 as uuidv4 } from 'uuid';
import { QueryCommand, GetCommand, UpdateCommand, DeleteCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb, TEAM_TABLE } from '../utils/dynamoClient.mjs';
import { validateTeamName, validateTeamDescription } from '../utils/teamValidator.mjs';
import {validateTeamUserIds}from '../utils/teamUserValidator.mjs'
/**
 * 팀 이름 중복 확인 서비스
 */
export const checkTeamName = async (teamName) => {
    const params = {
        TableName: TEAM_TABLE,
        IndexName: 'TeamName-Index',
        KeyConditionExpression: 'teamName = :teamName',
        ExpressionAttributeValues: { ':teamName': teamName }
    };
    const result = await dynamoDb.send(new QueryCommand(params));
    return result.Items.length === 0;
};

/**
 * 팀 생성 서비스
 */
export const createTeam = async ({ teamName, description, userIds }) => {
    const teamId = `TEAM#${uuidv4()}`; 

    if (userIds.length > 12) return { isValid: false, message: '최대 12명이어야 합니다.' };
    
    const nameValidation = validateTeamName(teamName);
    if (!nameValidation.isValid)throw new Error(nameValidation.message);
    
    const descriptionValidation = validateTeamDescription(description);
    if (!descriptionValidation.isValid) throw new Error(descriptionValidation.message);
    
    const validation = validateTeamUserIds(teamId, userIds);
    if (!validation.isValid) throw new Error(validation.message);

    const teamParams = {
        TableName: TEAM_TABLE,
        Item: {
            PK: teamId,
            SK: teamId,
            itemType: 'Team',
            teamName,
            description,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        }
    };
    await dynamoDb.send(new PutCommand(teamParams));

    const getRoleAndState = (index) => ({
        role: index === 0 ? 'Manager' : 'Member',
        inviteState: index === 0 ? 'complete' : 'processing',
    });

    const memberPromises = userIds.map(async (userId, index) => {
        const { role, inviteState } = getRoleAndState(index);
        try {
            return await dynamoDb.send(new PutCommand({
                TableName: TEAM_TABLE,
                Item: {
                    PK: teamId,
                    SK: userId,
                    itemType: 'TeamUser',
                    role,
                    inviteState,
                    createdAt: new Date().toISOString(),
                },
            }));
        } catch (error) {
            console.error(`Error adding user ${userId} to team ${teamId}:`, error);
        }
    });

    await Promise.all(memberPromises);
    return {teamId, teamName};
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
        UpdateExpression: 'SET teamName = :teamName, description = :description, updatedAt = :updatedAt',
        ExpressionAttributeValues: {
            ':teamName': teamName,
            ':description': description,
            ':updatedAt': new Date().toISOString(),
        },
        ReturnValues: 'ALL_NEW'
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
        ExpressionAttributeValues: {':pk': teamId }
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