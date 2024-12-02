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

if (!WEBSOCKET_ENDPOINT) {
    console.log("WEBSOCKET_ENDPOINT is not defined in environment variables");
    throw new Error("WEBSOCKET_ENDPOINT is not defined in environment variables");
}

export const handler = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2));

    try {
        if (event.Records) {
            // DynamoDB Stream 이벤트 처리
            return await handleStreamEvent(event);
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Invalid event type" }),
            };
        }
    } catch (error) {
        console.error("Error processing event:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "Internal server error", details: error.message }),
        };
    }
};

const handleStreamEvent = async (event) => {
    console.log("Processing DynamoDB Stream Event");

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
                message: `Welcome to chat room, ${teamName}`,
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
            "Access-Control-Allow-Headers": "Content-Type",
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

    console.log("DynamoDB Query Params:", JSON.stringify(params, null, 2));

    try {
        const result = await docClient.send(new QueryCommand(params));
        console.log("DynamoDB Query Result:", JSON.stringify(result, null, 2));

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
                    console.log("Processing item as JavaScript object:", item);
                    return item.SK; // Return SK directly if already unmarshalled
                }
                console.log("crewUsers item:", JSON.stringify(item));
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

        console.log("Crew users:", crewUsers);
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
        console.log("Message saved to DynamoDB:", JSON.stringify(params, null, 2));
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
                console.log(`Stale connection, deleting: ${connection_id}`);
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
    console.log(`Broadcasted message to room_id: ${room_id}`);
};