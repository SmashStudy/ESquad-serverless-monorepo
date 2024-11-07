const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET;

module.exports.handler = async (event) => {
  const { action, fileKey } = JSON.parse(event.body);
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileKey,
    Expires: 60 * 5, // Presigned URL 유효 시간 (5분)
  };

  let url;
  if (action === 'getObject') {
    url = await s3.getSignedUrlPromise('getObject', params);
  } else if (action === 'putObject') {
    url = await s3.getSignedUrlPromise('putObject', params);
  }

  return {
    statusCode: 200,
    body: JSON.stringify({ presignedUrl: url }),
  };
};
