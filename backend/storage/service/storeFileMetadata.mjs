import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const dynamoDb = DynamoDBDocumentClient.from(dynamoDbClient);
const TABLE_NAME = process.env.METADATA_TABLE;

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);
  try {
    const body = JSON.parse(event.body);
    const { fileKey, metadata } = body;
    const userId = decodeURIComponent(metadata.userId);
    const targetId = decodeURIComponent(metadata.targetId);
    console.log(`userId, targetId: ${userId}, ${targetId}`);

    const params = {
      TableName: TABLE_NAME,
      Item: {
        id: fileKey,
        userId: userId,
        targetId: targetId,
        targetType: metadata.targetType,
        fileSize: metadata.fileSize,
        extension: metadata.extension,
        contentType: metadata.contentType,
        originalFileName: metadata.originalFileName,
        storedFileName: metadata.storedFileName,
        createdAt: metadata.createdAt
      },
    };

    await dynamoDb.send(new PutCommand(params));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE',
      },
      body: JSON.stringify({ message: 'Metadata stored successfully', data: { id: fileKey, ...metadata } }),
    };
  } catch (error) {
    console.error('Error storing metadata:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE',
      },
      body: JSON.stringify({ error: `Failed to store metadata: ${error.message}` }),
    };
  }
};
