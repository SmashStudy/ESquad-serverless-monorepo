const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.METADATA_TABLE;

module.exports.handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2 )}`);

  const {storedFileName} = event.path;

  try {
    const deleteParams = {
      TableName: TABLE_NAME,
      Key: { id: "files/"+storedFileName },
    };

    await dynamoDb.delete(deleteParams).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `Metadata for ${storedFileName} deleted successfully` }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to delete metadata: ${error.message}` }),
    };
  }
};
