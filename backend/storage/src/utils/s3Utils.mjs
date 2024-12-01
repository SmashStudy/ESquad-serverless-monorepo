import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand
} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {createResponse} from './responseHelper.mjs'

const s3 = new S3Client({useAccelerateEndpoint: true});
const BUCKET_NAME = process.env.S3_BUCKET;

export const requestPresignedUrl = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);

  try {
    const body = JSON.parse(event.body);
    let {action, fileKey, contentType} = body;

    try {
      // 인코딩 여부에 따라 디코딩 시도
      fileKey = decodeURIComponent(fileKey);
    } catch (error) {
      // 이미 디코딩된 상태로 들어온 경우 아무 작업 안 함
      console.log("File name did not require decoding:", fileKey);
    }

    if (!action || !fileKey) {
      return createResponse(400,
          {error: "Missing required parameters: action and fileKey are required.",});
    }

    const params = {
      Bucket: BUCKET_NAME,
      Key: fileKey,
      ContentType: contentType,
    };

    let url;

    if (action === "getObject") {
      const command = new GetObjectCommand(params);
      url = await getSignedUrl(s3, command, {expiresIn: 60 * 5});
    } else if (action === "putObject") {
      const command = new PutObjectCommand(params);
      url = await getSignedUrl(s3, command, {expiresIn: 60 * 5});
    } else if (action === "deleteObject") {
      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: fileKey,
      });
      url = await getSignedUrl(s3, command, {expiresIn: 60 * 5});
    } else {
      return createResponse(400, {
        error: "Invalid action. Supported actions are getObject, putObject, deleteObject.",
      });
    }

    return createResponse(200, {presignedUrl: url});
  } catch (error) {
    console.error("Error generating presigned URL:", error);
    return createResponse(500, {
      error: `Failed to generate presigned URL: ${error.message}`,
    });

  }
};
