import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

const dynamoDb = new DynamoDBClient({});
const TABLE_NAME = process.env.METADATA_TABLE;

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);
  let { targetId, targetType } = event.queryStringParameters || {};
  targetId = decodeURIComponent(targetId);
  console.log(`targetId: ${targetId}, targetType: ${targetType}`);

  if (!targetId || !targetType) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Please provide both targetId and targetType.' }),
    };
  }

  const params = {
    TableName: TABLE_NAME,
    IndexName: 'FetchFileIndex', // 인덱스 생성 후 사용
    KeyConditionExpression: 'targetId = :targetId and targetType = :targetType',
    ExpressionAttributeValues: {
      ':targetId': { S : targetId },
      ':targetType': { S : targetType } ,
    },
  };

  try {
    const command = new QueryCommand(params);
    const rawData = await dynamoDb.send(command);
    console.log(`Raw Data: ${JSON.stringify(rawData.Items)}`);
    const files = rawData.Items.map((data) => ({
      id: data.id.S,
      targetId: data.targetId.S,
      targetType: data.targetType.S,
      userId: data.userId.S,
      fileSize: parseInt(data.fileSize.N, 10),
      extension: data.extension.S,
      contentType: data.contentType.S,
      storedFileName: data.storedFileName.S,
      originalFileName: data.originalFileName.S,
      createdAt: data.createdAt.S,
    }));

    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE',
      },
      statusCode: 200,
      body: JSON.stringify(files),
    };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE',
      },
      body: JSON.stringify({ error: `Failed to fetch metadata: ${error.message}` }),
    };
  }
};