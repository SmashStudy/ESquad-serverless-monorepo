const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.METADATA_TABLE;

module.exports.handler = async (event) => {
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
      body: JSON.stringify({ message: 'Metadata stored successfully' }),
    };
  } catch (error) {
    console.error('Error storing metadata:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to store metadata: ${error.message}` }),
    };
  }
};
