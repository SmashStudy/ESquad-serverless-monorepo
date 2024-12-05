import {PutCommand} from '@aws-sdk/lib-dynamodb';
import {requestPresignedUrl} from '../utils/s3Utils.mjs';
import {createResponse} from '../utils/responseHelper.mjs';
import {METADATA_TABLE, dynamoDb} from "../utils/dynamoUtil.mjs";

export const handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  let {
    originalFileName,
    targetId,
    targetType,
    userEmail,
    fileSize,
    contentType,
    actualType,
    userNickname,
    createdAt
  } = JSON.parse(event.body);
  originalFileName = decodeURIComponent(originalFileName);
  const fileKey = `files/${Date.now()}-${originalFileName}`;

  const presignedUrlEvent = {
    body: JSON.stringify({
      action: "putObject",
      fileKey,
      contentType: actualType
    })
  };

  try {
    const presignedResponse = await requestPresignedUrl(presignedUrlEvent);

    if (presignedResponse.statusCode !== 200) {
      console.error('Failed to get presigned URL:', presignedResponse.body);
      return createResponse(presignedResponse.statusCode,
          {error: presignedResponse.body.error});
    }

    const {presignedUrl} = JSON.parse(presignedResponse.body);

    // 메타데이터 DynamoDB에 저장
    const metadataParams = {
      TableName: METADATA_TABLE,
      Item: {
        targetId,
        targetType,
        fileKey,
        userEmail,
        userNickname,
        fileSize,
        extension: originalFileName.substring(
            originalFileName.lastIndexOf('.') + 1),
        contentType,
        originalFileName,
        createdAt,
        downloadCount: 0,
      },
    };
    await dynamoDb.send(new PutCommand(metadataParams));

    return createResponse(200, {presignedUrl, fileKey});

  } catch (error) {
    console.error('Error during file upload:', error);
    return createResponse(500,
        {error: `Error during file upload: ${error.message}`});
  }
};
