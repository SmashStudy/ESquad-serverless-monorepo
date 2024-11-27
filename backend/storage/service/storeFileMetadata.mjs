import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const dynamoDb = DynamoDBDocumentClient.from(dynamoDbClient);
const TABLE_NAME = process.env.METADATA_TABLE;

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);
  try {
    const body = JSON.parse(event.body);
    let { fileKey, metadata } = body;

    try {
      // 인코딩 여부에 따라 디코딩 시도
      fileKey = decodeURIComponent(fileKey);
    } catch (error) {
      // 이미 디코딩된 상태로 들어온 경우 아무 작업 안 함
      console.log("File name did not require decoding:", fileKey);
    }

    const params = {
      TableName: TABLE_NAME,
      Item: {
        fileKey: fileKey,
        ...metadata,
      },
    };

    await dynamoDb.send(new PutCommand(params));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': `${process.env.ALLOWED_ORIGIN}`,
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE',
      },
      body: JSON.stringify({ message: 'Metadata stored successfully', data: { fileKey: fileKey, ...metadata } }),
    };
  } catch (error) {
    console.error('Error storing metadata:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': `${process.env.ALLOWED_ORIGIN}`,
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE',
      },
      body: JSON.stringify({ error: `Failed to store metadata: ${error.message}` }),
    };
  }
};
