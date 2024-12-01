import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { DynamoDBClient, PutItemCommand, QueryCommand, DeleteCommand } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({ region: process.env.CHATTING_REGION });

const MESSAGE_TABLE = process.env.MESSAGE_TABLE_NAME;
const USERLIST_TABLE = process.env.USERLIST_TABLE_NAME;
const TEAMS_TABLE = process.env.TEAMS_TABLE_NAME;
const WEBSOCKET_ENDPOINT = process.env.WEBSOCKET_ENDPOINT;

if (!WEBSOCKET_ENDPOINT) {
    console.log("WEBSOCKET_ENDPOINT is not defined in environment variables");
    throw new Error("WEBSOCKET_ENDPOINT is not defined in environment variables");
}
export const handler = async (event) => {
    console.log("-------------> RECEIVED EVENT : ", JSON.stringify(event, null, 2));
    try {
        if (event.requestContext?.http?.method === "POST") {
            return await handleHttpEvent(event);
        }
        if (event.Records) {
            return await handleStreamEvent(event);
        }
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Invalid event type" }),
        };
    } catch (error) {
        console.error("ERROR processing message:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal server error", details: error.message }),
        };
    }
};

const handleHttpEvent = async (event) => {
    let body;
    try {
        body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
    } catch (error) {
        console.error("Failed to parse request body:", error.message);
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Invalid JSON body" }),
        };
    }

    const { teamID, teamName } = body;

    if (!teamID || !teamName) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: "Missing required fields: teamID, teamName" }),
        };
    }

    const timestamp = Date.now();

    const initialMessage = {
        room_id: teamID,
        timestamp,
        message: `Welcome to the chat room for ${teamName}`,
    };

    try {
        await client.send(
            new PutItemCommand({
                TableName: MESSAGE_TABLE,
                Item: {
                    room_id: { S: initialMessage.room_id },
                    timestamp: { N: initialMessage.timestamp.toString() },
                    message: { S: initialMessage.message },
                },
            })
        );

        console.log(`Chat room ${teamID} created successfully.`);

        return {
            statusCode: 201,
            headers: {
                "Access-Control-Allow-Origin": "*", // 모든 출처 허용
                "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ message: "Chat room created successfully.", room_id: teamID }),
        };
    } catch (error) {
        console.error("DynamoDB PutItemCommand failed:", error.message);
        throw new Error("Failed to create chat room");
    }
};

const handleStreamEvent = async (event) => {
    console.log("Processing DynamoDB Stream Event");

    for (const record of event.Records) {
        if (record.eventName !== "INSERT") continue;

        const newImage = record.dynamodb.NewImage;
        const teamData = unmarshall(newImage);

        // 팀 정보만 가지고오기
        if (teamData.itemType === "Team") {
            const teamPK = teamData.PK;
            const teamName = teamData.itemName;

            const crew_users = await getTeamCrewUsers(teamPK);

            const timestamp = Date.now();

            const initialMessage = {
                room_id: teamPK,
                timestamp,
                crew_users,
                teamName,
                message: `Welcome to chat room, ${teamName}`,
            };

            await client.send(
                new PutItemCommand({
                    TableName: MESSAGE_TABLE,
                    Item: {
                        room_id: { S: initialMessage.room_id },
                        timestamp: { N: initialMessage.timestamp.toString() },
                        crew_users: { SS: initialMessage.crew_users },
                        teamName: { S: teamName },
                        message: { S: initialMessage.message },
                    },
                })
            );
            await broadcastToConnections(teamPK, initialMessage.message);
        }
    }

    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({ message: "Messages sent successfully" }),
    };
};

// TeamTable 에 존재하는 itemType 이 TeamUser 일 경우 && PK 가 위 handleStreamEvent에서 찾은 팀 teamData.PK 이어야 함. 무적건.
const getTeamCrewUsers = async (teamPK) => {
    const params = {
        TableName: TEAMS_TABLE,
        KeyConditionExpression: "#PK = :pk",
        FilterExpression: "itemType = :itemType AND inviteState = :inviteState",
        ExpressionAttributeNames: {
            "#pk": "pk", // 'pk'라는 실제 필드명을 매핑
        },
        ExpressionAttributeValues: {
            ":pk": { S: teamPK },
            ":itemType": { S: "TeamUser" },
            ":inviteState": { S: "complete" },
        },
    };

    const result = await client.send(new QueryCommand(params));
    return result.Items.map((item) => unmarshall(item).SK);
};

const broadcastToConnections = async (room_id, message) => {
    const params = {
        TableName: USERLIST_TABLE,
        KeyConditionExpression: "room_id = :room_id",
        ExpressionAttributeValues: { ":room_id": { S: room_id } },
    };
    const result = await client.send(new QueryCommand(params));
    const connections = result.Items.map((item) => unmarshall(item).connection_id);

    const apiGatewayManagementApi = new ApiGatewayManagementApiClient({
        apiVersion: "2018-11-29",
        endpoint: WEBSOCKET_ENDPOINT,
    });

    const postCalls = connections.map(async (connection_id) => {
        try {
            await apiGatewayManagementApi.send(
                new PostToConnectionCommand({
                    ConnectionId: connection_id,
                    Data: JSON.stringify({ message }),
                })
            );
        } catch (e) {
            if (e.statusCode === 410) {
                console.log(`Stale connection, deleting: ${connection_id}`);
                await client.send(
                    new DeleteCommand({
                        TableName: USERLIST_TABLE,
                        Key: { connection_id: { S: connection_id } },
                    })
                );
            } else {
                console.error(`Failed to send message to ${connection_id}:, e.message`);
            }
        }
    });

    await Promise.all(postCalls);
    console.log(`Broadcasted message to room_id: ${room_id}`);
};