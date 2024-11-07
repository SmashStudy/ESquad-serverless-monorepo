const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET;

module.exports.handler = async (event) => {
  const { storedFileName } = event.pathParameters;

  try {
    await s3.deleteObject({
      Bucket: BUCKET_NAME,
      Key: storedFileName,
    }).promise();

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
