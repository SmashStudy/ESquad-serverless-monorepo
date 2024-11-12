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

/**
 * 유저가 소속된 모든 팀 조회
 */
export const getAllTeamSpaces = async (event) => {
    //const userId = event.requestContext.authorizer.claims.sub;
    const userId = "USER#123"
    const params = {
        TableName: TEAM_TABLE,
        IndexName: "SK-Index",
        KeyConditionExpression: "SK = :sk",
        FilterExpression: "itemType = :itemType",
        ExpressionAttributeValues: {
            ":sk": userId,
            ":itemType": "TeamSpaceUser"
        }
    };

    try {
        const result = await dynamoDb.send(new QueryCommand(params));
        return { statusCode: 200, body: JSON.stringify(result.Items) };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: JSON.stringify({ error: "Error retrieving teams" }) };
    }
};

/**
 * 팀 프로필 조회
 */
export const getTeamProfile = async (event) => {
    const teamId = event.pathParameters.teamId;
    const changedteamId = decodeURIComponent(teamId);
    console.log("Received teamId:", teamId);  

    const params = {
        TableName: TEAM_TABLE,
        Key: {
            PK: changedteamId,
            SK: changedteamId
        }
    };

    try {
        const result = await dynamoDb.send(new GetCommand(params));
        if (result.Item) {
            return { statusCode: 200, body: JSON.stringify(result.Item) };
        } else {
            return { statusCode: 404, body: JSON.stringify({ error: "Team not found" }) };
        }
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: JSON.stringify({ error: "Error retrieving team profile" }) };
    }
};

/**
 * 팀 수정
 */
export const updateTeam = async (event) => {
    const teamId = event.pathParameters.teamId;
    const { teamName, description } = JSON.parse(event.body);
    const changedteamId = decodeURIComponent(teamId);

    const params = {
        TableName: TEAM_TABLE,
        Key: {
            PK: changedteamId,
            SK: changedteamId
        },
        UpdateExpression: "SET teamName = :teamName, description = :description",
        ExpressionAttributeValues: {
            ":teamName": teamName,
            ":description": description
        },
        ReturnValues: "ALL_NEW"
    };

    try {
        const result = await dynamoDb.send(new UpdateCommand(params));
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Team updated successfully", data: result.Attributes })
        };
    } catch (error) {
        console.error(error);
        return { statusCode: 500, body: JSON.stringify({ error: "Error updating team" }) };
    }
};

/**
* 팀 삭제
*/
export const deleteTeam = async (event) => {
    const teamId = event.pathParameters.teamId;
    const changedTeamId = decodeURIComponent(teamId);

    // Step 1: Query all items with PK = changedTeamId (팀 관련 모든 항목 조회)
    const queryParams = {
        TableName: TEAM_TABLE,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: {
            ":pk": changedTeamId
        }
    };

    try {
        // Step 2: Query the table to get all related items
        const queryResult = await dynamoDb.send(new QueryCommand(queryParams));

        // Step 3: Loop through each item and delete it in parallel
        if (queryResult.Items && queryResult.Items.length > 0) {
            const deletePromises = queryResult.Items.map((item) => {
                const deleteParams = {
                    TableName: TEAM_TABLE,
                    Key: {
                        PK: item.PK,
                        SK: item.SK
                    }
                };
                return dynamoDb.send(new DeleteCommand(deleteParams));
            });
            await Promise.all(deletePromises);
        }

        // Step 4: Query and delete related items (e.g., 스터디, 책, 스터디 유저)
        const relatedItemsQueryParams = {
            TableName: TEAM_TABLE,
            IndexName: "teamID-Index",  // teamID를 기준으로 쿼리할 수 있는 인덱스 설정 필요
            KeyConditionExpression: "teamID = :teamID",
            ExpressionAttributeValues: {
                ":teamID": changedTeamId
            }
        };
        
        const relatedItemsResult = await dynamoDb.send(new QueryCommand(relatedItemsQueryParams));
        if (relatedItemsResult.Items && relatedItemsResult.Items.length > 0) {
            const relatedDeletePromises = relatedItemsResult.Items.map((item) => {
                // Delete all items where PK matches the related item's PK
                const deleteParams = {
                    TableName: TEAM_TABLE,
                    KeyConditionExpression: "PK = :pk",
                    ExpressionAttributeValues: {
                        ":pk": item.PK
                    }
                };
                return dynamoDb.send(new QueryCommand(deleteParams)).then((result) => {
                    if (result.Items && result.Items.length > 0) {
                        const deleteSubItemsPromises = result.Items.map((subItem) => {
                            const subItemDeleteParams = {
                                TableName: TEAM_TABLE,
                                Key: {
                                    PK: subItem.PK,
                                    SK: subItem.SK
                                }
                            };
                            return dynamoDb.send(new DeleteCommand(subItemDeleteParams));
                        });
                        return Promise.all(deleteSubItemsPromises);
                    }
                });
            });
            await Promise.all(relatedDeletePromises);
        }

        return { statusCode: 200, body: JSON.stringify({ message: "Team and related items deleted successfully" }) };
    } catch (error) {
        console.error("Error deleting team and related items:", error);
        return { statusCode: 500, body: JSON.stringify({ error: "Error deleting team and related items" }) };
    }
};
