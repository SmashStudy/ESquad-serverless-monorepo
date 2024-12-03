import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from "@aws-sdk/client-apigatewaymanagementapi";

// DynamoDB 클라이언트 초기화
const client = new DynamoDBClient({ region: process.env.CHATTING_REGION });
const docClient = DynamoDBDocumentClient.from(client);

// DynamoDB 쿼리 함수
async function query(
    tableName,
    keyConditionExpression,
    expressionAttributeValues,
    options = {}
) {
  const params = {
    TableName: tableName,
    KeyConditionExpression: keyConditionExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ...options,
  };

  try {
    const data = await docClient.send(new QueryCommand(params));
    console.log("query", data);
    return data.Items;
  } catch (err) {
    console.error("Error", err);
    throw err;
  }
}

// DynamoDB 항목 삭제 함수
async function deleteItem(tableName, key) {
  const params = {
    TableName: tableName,
    Key: key,
  };

  try {
    await docClient.send(new DeleteCommand(params));
  } catch (err) {
    console.error("Error", err);
    throw err;
  }
}

// Lambda 핸들러 함수
export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));
  console.log("Environment variables:", JSON.stringify(process.env, null, 2));

  // 이벤트에 레코드가 없는 경우 처리
  if (!event.Records || event.Records.length === 0) {
    console.log("No records found in the event");
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "No records to process" }),
    };
  }

  const record = event.Records[0];
  console.log("Processing record:", JSON.stringify(record, null, 2));

  // INSERT 이벤트가 아닌 경우 처리
  if (record.eventName !== "INSERT") {
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Not an INSERT event" }),
    };
  }

  // NewImage가 없는 경우 처리
  if (!record.dynamodb || !record.dynamodb.NewImage) {
    console.log("NewImage not found in the record");
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "No new image to process" }),
    };
  }

  // 새 이미지에서 항목 데이터 추출
  const newImage = record.dynamodb.NewImage;
  const item = {
    room_id: newImage.room_id?.S,
    timestamp: newImage.timestamp?.N
        ? parseInt(newImage.timestamp.N)
        : Date.now(),
    message: newImage.message?.S,
    user_id: newImage.user_id?.S,
    name: newImage.name?.S,
  };

  console.log("Extracted item:", item);

  // 필수 필드가 없는 경우 처리
  if (!item.room_id || !item.message) {
    console.log("Missing required fields in the item");
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "Missing required fields" }),
    };
  }

  try {
    // 해당 방의 모든 연결된 사용자 조회
    const users = await query(
        process.env.USERLIST_TABLE_NAME,
        "room_id = :room_id",
        { ":room_id": item.room_id },
        { IndexName: "room_id-user_id-index" }
    );

    // API Gateway Management API 클라이언트 초기화
    const apiId = process.env.socket_api_gateway_id;
    const stage = process.env.stage || process.env.CHATTING_STAGE;
    const region = process.env.AWS_REGION || process.env.CHATTING_REGION;
    const endpoint = `https://${apiId}.execute-api.${region}.amazonaws.com/${stage}`;
    console.log("API Gateway endpoint:", endpoint);

    const apigwManagementApi = new ApiGatewayManagementApiClient({
      apiVersion: "2018-11-29",
      endpoint: endpoint,
      region: process.env.CHATTING_REGION,
    });

    // 모든 연결된 사용자에게 메시지 전송
    const postCalls = users.map(async ({ connection_id }) => {
      try {
        await apigwManagementApi.send(
            new PostToConnectionCommand({
              connection_id: connection_id,
              Data: JSON.stringify(item),
            })
        );
      } catch (e) {
        if (e.statusCode === 410) {
          console.log(`Found stale connection, deleting ${connection_id}`);
          try {
            // 오래된 연결 삭제
            await deleteItem(process.env.USERLIST_TABLE_NAME, {
              connection_id: connection_id,
            });
          } catch (deleteErr) {
            console.log(deleteErr);
          }
        } else {
          throw e;
        }
      }
    });

    // 모든 메시지 전송 작업 완료 대기
    await Promise.all(postCalls);

    return {
      statusCode: 200,
      headers:{
        "Access-Control-Allow-Origin": "*", // 모든 출처 허용
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: "Messages sent successfully" }),
    };
  } catch (error) {
    console.error("Error processing event:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "An unexpected error occurred",
        details: error.message,
        stack: error.stack,
      }),
    };
  }
};
