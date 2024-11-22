import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const dynamoDb = DynamoDBDocumentClient.from(dynamoDbClient);
const TABLE_NAME = process.env.METADATA_TABLE;

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);

  let { storedFileName } = event.pathParameters;

  try {
    // 인코딩 여부에 따라 디코딩 시도
    storedFileName = decodeURIComponent(storedFileName);
  } catch (error) {
    // 이미 디코딩된 상태로 들어온 경우 아무 작업 안 함
    console.log("File name did not require decoding:", storedFileName);
  }

  try {
    const deleteParams = {
      TableName: TABLE_NAME,
      Key: { id: `files/${storedFileName}` },
    };

    await dynamoDb.send(new DeleteCommand(deleteParams));

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE',
      },
      body: JSON.stringify({ message: `Metadata for ${storedFileName} deleted successfully` }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE',
      },
      body: JSON.stringify({ error: `Failed to delete metadata: ${error.message}` }),
    };
  }
};
