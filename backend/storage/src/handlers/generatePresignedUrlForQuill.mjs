import {S3Client, PutObjectCommand} from "@aws-sdk/client-s3";
import {getSignedUrl} from "@aws-sdk/s3-request-presigner";
import {createResponse} from "../utils/responseHelper.mjs";
import {v4 as uuidv4} from "uuid";

const s3Client = new S3Client({region: process.env.AWS_REGION});

export const handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));
  try {
    // 요청 본문에서 파일 이름과 타입 추출
    const {fileName, fileType} = JSON.parse(event.body);
    const uniqueFileName = `${uuidv4()}-${fileName}`;

    if (!fileName || !fileType) {
      return createResponse(400, {
        message: 'Missing fileName or fileType in the request body.',
      })
    }

    // S3 Presigned URL 생성을 위한 파라미터
    const params = {
      Bucket: process.env.QUILL_S3_BUCKET,
      Key: `uploads/${uniqueFileName}`,
      ContentType: fileType,
    };

    const command = new PutObjectCommand(params);
    const uploadURL = await getSignedUrl(s3Client, command, {expiresIn: 300});
    const imageUrl = `https://${process.env.QUILL_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/uploads/${uniqueFileName}`;

    return createResponse(200, {
      uploadURL, imageUrl,
      message: 'Presigned URL successfully generated.',
    })

  } catch (error) {
    console.error('Error generating presigned URL:', error);

    return createResponse(500, {
      message: 'Failed to generate presigned URL.',
      error: error.message,
    })
  }
};
