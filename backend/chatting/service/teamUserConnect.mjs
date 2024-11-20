import {DynamoDBClient, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {unmarshall} from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({region : process.env.CHATTING_REGION});

const MESSAGE_TABLE = process.env.MESSAGE_TABLE_NAME;

export const handler = async (event) => {
    console.log("RECEIVED EVENT : ", JSON.stringify(event, null, 2));

    try {
        if(event.requestContext?.http?.method === "POST") {
            return await handleHttpEvent(event);
        }
        if (event.Records) {
            return await handleStreamEvent(event);
        }
        return {
            statusCode: 400,
            body: JSON.stringify({message: "Invalid event type"}),
        };
    } catch (error) {
        console.log("ERROR processing message: ", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({error: "Internal server error", details: error.message}),
        };
    }
};

const handleStreamEvent = async (event) => {
    console.log("Processing DynamoDB Stream Event");

    for(const record of event.Records){
        if(record.eventName !== "INSERT") {
            console.log(`Not INSERT event, ${record.eventName}`);
            continue;
        }
        const newImage = record.dynamodb.NewImage;
        const teamData = unmarshall(newImage);

        const {PK, SK, teamName, itemType } = teamData;

        if (itemType !== "Team") {
            console.log(`Not itemType "TEAM" , ${itemType}`);
            continue;
        }

        const timestamp = Date.now();
        const room_id = PK;

        const initialMessage = {
            room_id: room_id,
            timestamp,
            message: `Welcome to chat room , ${teamName}`,
        };
        console.log("Create Chat Room", initialMessage);

        await client.send(
            new PutItemCommand({
                TableName: MESSAGE_TABLE,
                Item: {
                    room_id: {S: initialMessage.room_id},
                    timestamp: {N: initialMessage.timestamp.toString()},
                    message: {S: initialMessage.message},
                },
            })
        );
        console.log(`Chat room ${room_id} created`);
    }
    return {
        statusCode: 200,
        body: JSON.stringify({message: "Stream processed successfully"}),
    };
};

const handleHttpEvent = async (event) => {
    console.log("Processing HTTP POST Event");
    console.log("Event Body: ", event.body);

    let body;
    try {
        body = JSON.parse(event.body);
    } catch (error) {
        console.error("Failed to parse request body: ", error.message);
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

    console.log("Creating Chat Room with Message:", initialMessage);

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
        body: JSON.stringify({ message: "Chat room created successfully.", room_id: teamID }),
    };
};
