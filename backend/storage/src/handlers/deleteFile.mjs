import {DeleteCommand} from '@aws-sdk/lib-dynamodb';
import {createResponse} from '../utils/responseHelper.mjs'
import {requestPresignedUrl} from "../utils/s3Utils.mjs";
import {METADATA_TABLE, dynamoDb} from "../utils/dynamoUtil.mjs";

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);

  let {fileKey} = event.pathParameters;

  try {
    fileKey = decodeURIComponent(fileKey);
  } catch (error) {
    console.log("File name did not require decoding:", fileKey);
  }

  let presignedUrl;

  try {
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

    return createResponse(200,
        {presignedUrl});
  } catch (error) {
    return createResponse(500,
        {error: `Failed to delete metadata: ${error.message}`});
  }
};
