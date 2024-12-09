import {GetCommand, UpdateCommand} from '@aws-sdk/lib-dynamodb';
import {createResponse} from '../utils/responseHelper.mjs';
import {requestPresignedUrl} from '../utils/s3Utils.mjs'; // Presigned URL 생성 함수
import {METADATA_TABLE, dynamoDb} from "../utils/dynamoUtil.mjs";
import {sendLog} from "../utils/logActionHelper.mjs";
import {requestExtractor} from "../utils/extractLoggingInfo.mjs";
import {getFormattedDate} from "../utils/dateUtil.mjs";

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);
  let {fileKey} = event.pathParameters;

  try {
    fileKey = decodeURIComponent(fileKey);
  } catch (error) {
    console.log("fileKey did not require decoding:", fileKey);
  }

  let fileMetadata;
  let presignedUrl;

  try {

    // 로그 수집을 위해 메타데이터 수집
    const getParams = {
      TableName: METADATA_TABLE,
      Key: { fileKey: fileKey },
    };
    const metadataResult = await dynamoDb.send(new GetCommand(getParams));
    fileMetadata = metadataResult.Item;

    // Presigned URL 생성
    const presignedResponse = await requestPresignedUrl({
      body: JSON.stringify({
        action: 'getObject',
        fileKey
      })
    });

    if (presignedResponse.error) {
      return createResponse(400, {error: presignedResponse.error});
    }

    // `createResponse`로부터 실제 `presignedUrl`을 추출
    const responseData = JSON.parse(presignedResponse.body);
    presignedUrl = responseData.presignedUrl;

    // 다운로드 횟수 업데이트
    const updateParams = {
      TableName: METADATA_TABLE,
      Key: {fileKey},
      UpdateExpression: 'SET downloadCount = if_not_exists(downloadCount, :start) + :incr',
      ExpressionAttributeValues: {
        ':start': 0,
        ':incr': 1,
      },
      ReturnValues: 'UPDATED_NEW',
    };
    await dynamoDb.send(new UpdateCommand(updateParams));

    // 로그 처리
    const {ipAddress, userAgent, email, group} = requestExtractor(event)
    const logData = {
      action: "DOWNLOAD",
      fileKey: fileMetadata.fileKey,
      originalFileName: fileMetadata.originalFileName,
      uploaderEmail: fileMetadata.userEmail,
      userEmail: email, // 사용자 이메일 (JWT에서 추출)
      userRole: group, // 사용자 역할 (JWT에서 추출)
      createdAt: getFormattedDate(),
      fileSize: fileMetadata.fileSize,
      targetId: fileMetadata.targetId,
      targetType: fileMetadata.targetType,
      ipAddress: ipAddress,
      userAgent: userAgent,

    };

    await sendLog(logData);

    return createResponse(200, {presignedUrl});

  } catch (error) {
    console.error('Error during file download:', error);
    return createResponse(500,
        {error: `Error during file download: ${error.message}`});
  }
};
