const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const BUCKET_NAME = process.env.S3_BUCKET;
const TABLE_NAME = process.env.METADATA_TABLE;

module.exports.handler = async (event) => {
  const { storedFileName } = event.pathParameters;

  try {
    // S3에서 파일 삭제
    await s3.deleteObject({
      Bucket: BUCKET_NAME,
      Key: storedFileName,
    }).promise();

    // DynamoDB에서 메타데이터 삭제
    const deleteParams = {
      TableName: TABLE_NAME,
      Key: { id: storedFileName },
    };

    await dynamoDb.delete(deleteParams).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: `File ${storedFileName} deleted successfully` }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Failed to delete file: ${error.message}` }),
    };
  }
};
