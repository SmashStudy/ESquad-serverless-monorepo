import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { createResponse } from '../utils/responseHelper.mjs';
import { requestPresignedUrl } from '../utils/s3Utils.mjs'; // Presigned URL 생성 함수

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const dynamoDb = DynamoDBDocumentClient.from(dynamoDbClient);
const TABLE_NAME = process.env.METADATA_TABLE;

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);
  let { fileKey } = event.pathParameters;

  try {
    fileKey = decodeURIComponent(fileKey);
  } catch (error) {
    console.log("fileKey did not require decoding:", fileKey);
  }

  let presignedUrl;
  try {
    // Presigned URL 생성
    const presignedResponse = await requestPresignedUrl({
      body: JSON.stringify({
        action: 'getObject',
        fileKey
      })
    });

    if (presignedResponse.error) {
      return createResponse(400, { error: presignedResponse.error });
    }

    // `createResponse`로부터 실제 `presignedUrl`을 추출
    const responseData = JSON.parse(presignedResponse.body);
    presignedUrl = responseData.presignedUrl;

    // 다운로드 횟수 업데이트
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
