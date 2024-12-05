import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, QueryCommand, DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";
import { unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({ region: process.env.CHATTING_REGION });
const docClient = DynamoDBDocumentClient.from(client);

const MESSAGE_TABLE = process.env.MESSAGE_TABLE_NAME;
const USERLIST_TABLE = process.env.USERLIST_TABLE_NAME;
const TEAM_TABLE = process.env.TEAM_TABLE_NAME;
const WEBSOCKET_ENDPOINT = process.env.WEBSOCKET_ENDPOINT;

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export const handler = async (event) => {
    try {
        if (event.Records) {
            // Handle DynamoDB Stream events
            return {
                ...await handleStreamEvent(event),
                headers: corsHeaders,
            };
        } else if (event.httpMethod) {
            // Handle HTTP events
            if (event.httpMethod === "GET" && event.path === "/team") {
                return await handleHttpGetTeam(event);
            } else if (event.httpMethod === "OPTIONS") {
                // Handle preflight CORS requests
                return {
                    statusCode: 200,
                    headers: corsHeaders,
                    body: null,
                };
            } else {
                return {
                    statusCode: 400,
                    headers: corsHeaders,
                    body: JSON.stringify({ message: "Invalid HTTP method" }),
                };
            }
        } else {
            return {
                statusCode: 400,
                headers: corsHeaders,
                body: JSON.stringify({ message: "Invalid event type" }),
            };
        }
    } catch (error) {
        console.error("Error processing event:", error.message);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: "Internal server error", details: error.message }),
        };
    }
};

const handleHttpGetTeam = async (event) => {
    try {
        const params = {
            TableName: TEAM_TABLE,
            KeyConditionExpression: "#PK = :PK",
            FilterExpression: "itemType = :itemType",
            ExpressionAttributeNames: {
                "#PK": "PK",
            },
            ExpressionAttributeValues: {
                ":PK": "TEAM_DATA", // 모든 팀 데이터를 저장한 PK
                ":itemType": "Team",
            },
        };
        const result = await docClient.send(new QueryCommand(params));

        const teams = result.Items.map((item) => unmarshall(item));
        return {
            statusCode: 200,
            headers: corsHeaders,
            body: JSON.stringify(teams),
        };
    } catch (error) {
        console.error("Failed to fetch teams:", error.message);
        return {
            statusCode: 500,
            headers: corsHeaders,
            body: JSON.stringify({ error: "Failed to fetch teams", details: error.message }),
        };
    }
};

const handleStreamEvent = async (event) => {
    for (const record of event.Records) {
        if (record.eventName !== "INSERT") continue;

        const newImage = record.dynamodb.NewImage;
        const teamData = unmarshall(newImage);

        // 팀 데이터 확인
        if (teamData.itemType === "Team") {
            const teamPK = teamData.PK;
            const teamName = teamData.teamName;

            // 팀 소속 크루 가져오기
            const crewUsers = await getTeamCrewUsers(teamPK);

            const timestamp = Date.now();

            // 메시지 테이블에 저장
            const messageData = {
                room_id: teamPK,
                timestamp,
                crew_users: crewUsers,
                teamName,
            };
            await saveMessageToTable(messageData);

            // 연결된 사용자들에게 메시지 브로드캐스트
            await broadcastToConnections(teamPK, messageData.message);
        }
    }
    return {
        statusCode: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
        },
        body: JSON.stringify({ message: "Messages sent successfully" }),
    };
};

// TeamTable 에 존재하는 itemType 이 TeamUser 일 경우 && PK 가 위 handleStreamEvent에서 찾은 팀 teamData.PK 이어야 함. 무적건.
const getTeamCrewUsers = async (teamPK) => {
    const params = {
        TableName: TEAM_TABLE,
        KeyConditionExpression: "#PK = :PK",
        FilterExpression: "itemType = :itemType AND inviteState = :inviteState",
        ExpressionAttributeNames: {
            "#PK": "PK",
        },
        ExpressionAttributeValues: {
            ":PK": teamPK,
            ":itemType": "TeamUser",
            ":inviteState": "complete",
        },
    };
    try {
        const result = await docClient.send(new QueryCommand(params));
        // Ensure result.Items is an array
        const items = result.Items || [];
        if (items.length === 0) {
            console.warn(`No crew users found for team: ${teamPK}`);
            return [];
        }

        // Safely process each item and log potential issues
        const crewUsers = items.map((item) => {
            try {
                if (item.PK && item.SK && typeof item.SK === "string") {
                    return item.SK; // Return SK directly if already unmarshalled
                }
                const unmarshalledItem = unmarshall(item);
                if (!unmarshalledItem.SK) {
                    throw new Error(`Missing SK field in item: ${JSON.stringify(unmarshalledItem)}`);
                }
                return unmarshalledItem.SK;
            } catch (error) {
                console.error(`Error unmarshalling item: ${JSON.stringify(item)}, Error: ${error.message}`);
                return null; // Skip problematic items
            }
        }).filter((user) => user !== null); // Remove null values
        return crewUsers;
    } catch (error) {
        console.error(`Error fetching crew users for team ${teamPK}:`, error.message);
        throw new Error("Failed to fetch team crew users");
    }
};

const saveMessageToTable = async (messageData) => {
    const { room_id, timestamp, crew_users, teamName, message } = messageData;

    const params = {
        TableName: MESSAGE_TABLE,
        Item: {
            room_id,
            timestamp,
            crew_users, // String Set
            teamName,
            message,
        },
    };

    try {
        await docClient.send(new PutCommand(params));
    } catch (error) {
        console.error("Failed to save message to table:", error.message);
        throw new Error("Failed to save message");
    }
};

const broadcastToConnections = async (room_id, message) => {
    const params = {
        TableName: USERLIST_TABLE,
        IndexName:"room_id-user_id-index",
        KeyConditionExpression: "room_id = :room_id",
        ExpressionAttributeValues: { ":room_id": room_id },
    };

    const result = await docClient.send(new QueryCommand(params));
    const connections = result.Items.map((item) => unmarshall(item).connection_id);

    const apiGatewayManagementApi = new ApiGatewayManagementApiClient({ endpoint: WEBSOCKET_ENDPOINT });

    const postCalls = connections.map(async (connection_id) => {
        try {
            await apiGatewayManagementApi.send(new PostToConnectionCommand({
                ConnectionId: connection_id,
                Data: JSON.stringify({ message }),
            }));
        } catch (error) {
            if (error.statusCode === 410) {
                await docClient.send(new DeleteCommand({
                    TableName: USERLIST_TABLE,
                    Key: { connection_id },
                }));
            } else {
                console.error(`Failed to send message to ${connection_id}:`, error.message);
            }
        }
    });
    await Promise.all(postCalls);
};