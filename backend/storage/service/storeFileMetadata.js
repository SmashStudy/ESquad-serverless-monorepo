const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET;

module.exports.handler = async (event) => {
  try {
    const { fileKey, metadata } = event.body;
    const metadataKey = `metadata/${fileKey}.json`;

    const params = {
      Bucket: BUCKET_NAME,
      Key: metadataKey,
      Body: JSON.stringify(metadata),
      ContentType: 'application/json',
    };

    await s3.putObject(params).promise();

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
