import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const dynamoDb = DynamoDBDocumentClient.from(dynamoDbClient);
const TABLE_NAME = process.env.METADATA_TABLE;

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);
  let { userEmail } = event.queryStringParameters || {};

  try {
    // 인코딩 여부에 따라 디코딩 시도
    userEmail = decodeURIComponent(userEmail);
  } catch (error) {
    // 이미 디코딩된 상태로 들어온 경우 아무 작업 안 함
    console.log("File name did not require decoding:", userEmail);
  }

  if (!userEmail) {
    return {
      statusCode: 400,
      headers : {
        'Access-Control-Allow-Origin': `${process.env.ALLOWED_ORIGIN}`,
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE',
      },
      body: JSON.stringify({ error: 'Please provide userEmail' }),
    };
  }

  const params = {
    TableName: TABLE_NAME,
    IndexName: 'UserUsageIndex',
    KeyConditionExpression: 'userEmail = :userEmail',
    ExpressionAttributeValues: {
      ':userEmail': userEmail,
    },
  };

  try {
    const data = await dynamoDb.send(new QueryCommand(params));
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': `${process.env.ALLOWED_ORIGIN}`,
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE',
      },
      body: JSON.stringify(data.Items),
    };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': `${process.env.ALLOWED_ORIGIN}`,
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE',
      },
      body: JSON.stringify({ error: `Failed to fetch metadata: ${error.message}` }),
    };
  }
};
