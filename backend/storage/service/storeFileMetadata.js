const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.METADATA_TABLE;

module.exports.handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2 )}`);
  try {
    const { fileKey, metadata } = event.body;

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
      body: JSON.stringify({ message: 'Metadata stored successfully', data: { id: fileKey, ...metadata } }),
    };
  } catch (error) {
    console.error('Error storing metadata:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to store metadata: ${error.message}` }),
    };
  }
};
