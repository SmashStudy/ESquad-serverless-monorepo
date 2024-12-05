import {PutCommand} from '@aws-sdk/lib-dynamodb';
import {createResponse} from '../utils/responseHelper.mjs'
import {METADATA_TABLE, dynamoDb} from "../utils/dynamoUtil.mjs";

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);
  try {
    const body = JSON.parse(event.body);
    let {fileKey, metadata} = body;

    try {
      // 인코딩 여부에 따라 디코딩 시도
      fileKey = decodeURIComponent(fileKey);
    } catch (error) {
      // 이미 디코딩된 상태로 들어온 경우 아무 작업 안 함
      console.log("File name did not require decoding:", fileKey);
    }

    const params = {
      TableName: METADATA_TABLE,
      Item: {
        fileKey: fileKey,
        ...metadata,
      },
    };

    await dynamoDb.send(new PutCommand(params));

    return createResponse(200, {
      message: 'Metadata stored successfully',
      data: {fileKey: fileKey, ...metadata}
    });
  } catch (error) {
    console.error('Error storing metadata:', error);
    return createResponse(500,
        {error: `Failed to store metadata: ${error.message}`});
  }
};
