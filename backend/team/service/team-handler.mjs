import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {PutCommand, GetCommand, QueryCommand, UpdateCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';

const dynamoDb = new DynamoDBClient( {region: process.region});
const TEAM_TABLE = process.env.TEAM_TABLE;

/**
 * 팀 생성
 */
export const createTeam = async (event) => {
    const { teamName, description, userIds = [] } = JSON.parse(event.body);
    const teamId = `TEAM#${uuidv4()}`;
    if (userIds.length === 0) {
        console.error('No user IDs provided');
        return {
          statusCode: 400,
          body: JSON.stringify({ error: 'User IDs are required' }),
          headers: {
            "Access-Control-Allow-Origin": "*",  // CORS 허용
            "Content-Type": "application/json",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE"
          }
        };
    }
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

    try {
        await dynamoDb.send(new PutCommand(teamParams));
        
        const teamPromises = userIds.map((userId, index) => {
            const role = index === 0 ? "Manager" : "Member";  // 첫 번째 요소는 Manager, 나머지는 Member
            const teamUserParams = {
                TableName: TEAM_TABLE,
                Item: {
                    PK: teamId,
                    SK: userId,
                    itemType: "TeamSpaceUser",
                    role: role,  // 역할을 동적으로 할당
                }
            };
            return dynamoDb.send(new PutCommand(teamUserParams));
        });
        await Promise.all(teamPromises);
        return {
            statusCode: 201,
            body: JSON.stringify({ teamId, teamName }),
            headers: {
                "Access-Control-Allow-Origin": "*",  // CORS 허용
                "Content-Type": "application/json"
            }
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Error creating team" }),
            headers: {
                "Access-Control-Allow-Origin": "*",  // CORS 허용
                "Content-Type": "application/json"
            }
        };
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
        return { 
            statusCode: 200, 
            body: "Team name is available",          
            headers: {
                "Access-Control-Allow-Origin": "*",  // CORS 허용
                "Content-Type": "application/json",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE"
            } 
        };
    } catch (error) {
        console.error(error);
        return { 
            statusCode: 400, 
            body: JSON.stringify({ 
            error: "Error dchecking team name" }),          
            headers: {
                "Access-Control-Allow-Origin": "*",  // CORS 허용
                "Content-Type": "application/json",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET,PUT,DELETE"
            } 
        };
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

    const queryParams = {
        TableName: TEAM_TABLE,
        KeyConditionExpression: "PK = :pk",
        ExpressionAttributeValues: {
            ":pk": changedTeamId
        }
    };

    try {
        const queryResult = await dynamoDb.send(new QueryCommand(queryParams));

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

        const relatedItemsQueryParams = {
            TableName: TEAM_TABLE,
            IndexName: "teamID-Index",
            KeyConditionExpression: "teamID = :teamID",
            ExpressionAttributeValues: {
                ":teamID": changedTeamId
            }
        };
        
        const relatedItemsResult = await dynamoDb.send(new QueryCommand(relatedItemsQueryParams));
        if (relatedItemsResult.Items && relatedItemsResult.Items.length > 0) {
            const relatedDeletePromises = relatedItemsResult.Items.map((item) => {
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