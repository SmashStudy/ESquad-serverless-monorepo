import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocumentClient, DeleteCommand} from '@aws-sdk/lib-dynamodb';
import {createResponse} from '../utils/responseHelper.mjs'
import {requestPresignedUrl} from "../utils/s3Utils.mjs";

const dynamoDbClient = new DynamoDBClient({region: process.env.AWS_REGION});
const dynamoDb = DynamoDBDocumentClient.from(dynamoDbClient);
const TABLE_NAME = process.env.METADATA_TABLE;

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
      TableName: TABLE_NAME,
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
      return createResponse(400, { error: presignedResponse.error });
    }

    const responseData = JSON.parse(presignedResponse.body);
    presignedUrl = responseData.presignedUrl;

    return createResponse(200,
        { presignedUrl });
  } catch (error) {
    return createResponse(500,
        {error: `Failed to delete metadata: ${error.message}`});
  }
};
