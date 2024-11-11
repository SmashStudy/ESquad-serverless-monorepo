import AWS from 'aws-sdk';

const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET;

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);
  const body = JSON.parse(event.body);
  const { action, fileKey, contentType } = body;
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileKey,
    Expires: 60 * 5,
    ContentType: contentType,
  };

  let url;
  if (action === 'getObject') {
    url = await s3.getSignedUrlPromise('getObject', params);
  } else if (action === 'putObject') {
    url = await s3.getSignedUrlPromise('putObject', params);
  } else if (action === 'deleteObject') {
    url = await s3.getSignedUrlPromise('deleteObject', params);
  }

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE',
    },
    body: JSON.stringify({ presignedUrl: url }),
  };
};
