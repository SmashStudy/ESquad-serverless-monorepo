import AWS from 'aws-sdk';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.METADATA_TABLE;

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);
  try {
    const body = JSON.parse(event.body);
    const { fileKey, metadata } = body;

    const params = {
      TableName: TABLE_NAME,
      Item: {
        id: fileKey,
        ...metadata,
      },
    };

    await dynamoDb.put(params).promise();

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
