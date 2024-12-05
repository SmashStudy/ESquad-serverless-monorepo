import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { Base64 } from "js-base64";
import moment from "moment";
import * as ddbUtil from "../lib/ddbUtil.mjs"

// DynamoDB 클라이언트 초기화
const dynamodb = new DynamoDBClient({ region: process.env.CHATTING_REGION });

const USERLIST_TABLE_NAME = process.env.USERLIST_TABLE_NAME;

const apiSpec = {
    category: "chat",
    event: [
        {
            type: "websocket",
            method: "websocket",
            route: "$connect",
        },
    ],
    desc: "웹소켓 연결 처리.",
    parameters: {
        room_id: { req: true, type: "String", desc: "현재 채팅이 이루어진 방의 아이디" },
    },
    errors: {
        unexpected_error: { status_code: 500, reason: "unexpected_error" },
    },
    responses: {
        description: "",
        content: "application/json",
        schema: {
            type: "object",
            properties: {},
        },
    },
};

export { apiSpec };

export const handler = async (event, context) => {
    console.log(event);

    // 쿼리 문자열 파라미터에서 room_id와 user_id를 추출
    const queryStringParameters = event.queryStringParameters || {};

    const { room_id, user_id } = queryStringParameters;

    if (!room_id || !user_id) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "room_id and user_id are required" }),
        };
    }

    const item = {
        room_id: { S: room_id },
        connection_id: { S: event.requestContext.connectionId },
        user_id: { S: user_id },
        timestamp: { N: moment().valueOf().toString() },
    };

    try {
        const command = new PutItemCommand({
            TableName: USERLIST_TABLE_NAME,
            Item: item,
        });

        await dynamodb.send(command);

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*", // 모든 출처 허용
                "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization",
            },
            body: JSON.stringify({ message: "Connected successfully" }),
        };
    } catch (e) {
        console.error(e);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error" }),
        };
    }
};