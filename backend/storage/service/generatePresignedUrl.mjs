import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({});
const BUCKET_NAME = process.env.S3_BUCKET;

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);

  try {
    const body = JSON.parse(event.body);
    const { action, fileKey, contentType } = body;

    if (!action || !fileKey) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': `${process.env.ALLOWED_ORIGIN}`,
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE',
        },
        body: JSON.stringify({
          error: "Missing required parameters: action and fileKey are required.",
        }),
      };
    }

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
    };

    let url;

    if (action === "getObject") {
      const command = new GetObjectCommand(params);
      url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });
    } else if (action === "putObject") {
      const command = new PutObjectCommand(params);
      url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });
    } else if (action === "deleteObject") {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
      });
      url = await getSignedUrl(s3, command, { expiresIn: 60 * 5 });
    } else {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': `${process.env.ALLOWED_ORIGIN}`,
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE',
        },
        body: JSON.stringify({
          error: "Invalid action. Supported actions are getObject, putObject, deleteObject.",
        }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': `${process.env.ALLOWED_ORIGIN}`,
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE',
      },
      body: JSON.stringify({ presignedUrl: url }),
    };
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': `${process.env.ALLOWED_ORIGIN}`,
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE',
      },
      body: JSON.stringify({
        error: `Failed to generate presigned URL: ${error.message}`,
      }),
    };
  }
};
