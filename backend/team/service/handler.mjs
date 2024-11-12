import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';

const dynamoDb = new DynamoDBClient({ region: 'us-east-2' });
const TEAM_TABLE = "TeamTable";

/**
 * 팀 생성
 */
export const createTeam = async (event) => {
    const { teamName, description, userId } = JSON.parse(event.body);
    const teamId = `TEAM#${uuidv4()}`;

    const teamParams = {
        TableName: TEAM_TABLE,
        Item: {
            PK: teamId,
            SK: teamId,
            itemType: "TeamSpace",
            teamName: teamName,
            description: description
        }
    };

    const teamUserParams = {
        TableName: TEAM_TABLE,
        Item: {
            PK: teamId,
            SK: userId,
            itemType: "TeamSpaceUser",
            role: "Manager"
        }
    };

    try {
        await dynamoDb.send(new PutCommand(teamParams));
        await dynamoDb.send(new PutCommand(teamUserParams));
        return { statusCode: 201, body: JSON.stringify({ teamId, teamName }) };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: JSON.stringify({ error: "Error creating team" }) };
    }
};


/**
 * 팀 이름 중복 확인
 */
export const checkTeamName = async (event) => {
    const teamName = event.pathParameters.teamName;

    const params = {
        TableName: TEAM_TABLE,
        IndexName: 'TeamNameIndex',
        KeyConditionExpression: "teamName = :teamName",
        ExpressionAttributeValues: {
            ":teamName": teamName
        }
    };

    try {
        const result = await dynamoDb.send(new QueryCommand(params));
        if (result.Items.length > 0) {
            return { statusCode: 400, body: "Team name already exists" };
        }
        return { statusCode: 200, body: "Team name is available" };
    } catch (error) {
        console.error(error);
        return { statusCode: 400, body: JSON.stringify({ error: "Error dchecking team name" }) };
    }
};
