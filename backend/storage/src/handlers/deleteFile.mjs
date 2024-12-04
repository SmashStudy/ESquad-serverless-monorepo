import {GetCommand, DeleteCommand} from '@aws-sdk/lib-dynamodb';
import {createResponse} from '../utils/responseHelper.mjs'
import {requestPresignedUrl} from "../utils/s3Utils.mjs";
import {METADATA_TABLE, dynamoDb} from "../utils/dynamoUtil.mjs";
import {sendLog} from "../utils/logActionHelper.mjs";
import {requestExtractor} from "../utils/extractLoggingInfo.mjs";

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);

  let {fileKey} = event.pathParameters;

  try {
    fileKey = decodeURIComponent(fileKey);
  } catch (error) {
    console.log("File name did not require decoding:", fileKey);
  }

  let fileMetadata;
  let presignedUrl;

  try {


    const getParams = {
      TableName: METADATA_TABLE,
      Key: { fileKey: fileKey },
    };
    const metadataResult = await dynamoDb.send(new GetCommand(getParams));
    fileMetadata = metadataResult.Item;




    const deleteParams = {
      TableName: METADATA_TABLE,
      Key: {fileKey: fileKey},
    };

    await dynamoDb.send(new DeleteCommand(deleteParams));

    const presignedResponse = await requestPresignedUrl({
      body: JSON.stringify({
        action: 'deleteObject',
        fileKey
      })
    });

    if (presignedResponse.error) {
      return createResponse(400, {error: presignedResponse.error});
    }

    const responseData = JSON.parse(presignedResponse.body);
    presignedUrl = responseData.presignedUrl;

    // 로그 처리
    const {ipAddress, userAgent, email, group} = requestExtractor(event)
    const logData = {
      action: "DELETE",
      fileKey: fileMetadata.fileKey,
      originalFileName: fileMetadata.originalFileName,
      uploaderEmail: fileMetadata.userEmail,
      userEmail: email, // 사용자 이메일 (JWT에서 추출)
      userRole: group, // 사용자 역할 (JWT에서 추출)
      createdAt: new Date().toISOString(),
      fileSize: fileMetadata.fileSize,
      targetId: fileMetadata.targetId,
      targetType: fileMetadata.targetType,
      ipAddress: ipAddress,
      userAgent: userAgent,
    };

    await sendLog(logData);


    return createResponse(200,
        {presignedUrl});
  } catch (error) {
    return createResponse(500,
        {error: `Failed to delete metadata: ${error.message}`});
  }
};
