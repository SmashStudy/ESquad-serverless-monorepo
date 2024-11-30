import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { createResponse } from '../util/responseHelper.mjs';
import { handler } from './generatePresignedUrl.mjs'; // Presigned URL 생성 함수

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const dynamoDb = DynamoDBDocumentClient.from(dynamoDbClient);
const TABLE_NAME = process.env.METADATA_TABLE;

export const downloadFileHandler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);
  let { fileKey } = event.pathParameters;
  try {
    fileKey = decodeURIComponent(fileKey);
  } catch (error) {
    console.log("fileKey did not require decoding:", fileKey);
  }

  let presignedUrl;
  try {
    const presignedResponse = await handler('getObject', fileKey);
    if (presignedResponse.error) {
      return createResponse(400, { error: presignedResponse.error });
    }
    presignedUrl = presignedResponse.presignedUrl;

    // 2. 다운로드 횟수 업데이트
    const updateParams = {
      TableName: TABLE_NAME,
      Key: { fileKey },
      UpdateExpression: 'SET downloadCount = if_not_exists(downloadCount, :start) + :incr',
      ExpressionAttributeValues: {
        ':start': 0,
        ':incr': 1,
      },
      ReturnValues: 'UPDATED_NEW',
    };
    await dynamoDb.send(new UpdateCommand(updateParams));

    return createResponse(200, { presignedUrl });

  } catch (error) {
    console.error('Error during file download:', error);
    return createResponse(500, { error: `Error during file download: ${error.message}` });
  }
};
