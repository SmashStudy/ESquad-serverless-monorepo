import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocumentClient, DeleteCommand} from '@aws-sdk/lib-dynamodb';
import {createResponse} from '../utils/responseHelper.mjs'

const dynamoDbClient = new DynamoDBClient({region: process.env.AWS_REGION});
const dynamoDb = DynamoDBDocumentClient.from(dynamoDbClient);
const TABLE_NAME = process.env.METADATA_TABLE;

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);

  let {fileKey} = event.pathParameters;

  try {
    // 인코딩 여부에 따라 디코딩 시도
    fileKey = decodeURIComponent(fileKey);
  } catch (error) {
    // 이미 디코딩된 상태로 들어온 경우 아무 작업 안 함
    console.log("File name did not require decoding:", fileKey);
  }

  try {
    const deleteParams = {
      TableName: TABLE_NAME,
      Key: {fileKey: fileKey},
    };

    await dynamoDb.send(new DeleteCommand(deleteParams));

    return createResponse(200,
        {message: `Metadata for ${fileKey} deleted successfully`});
  } catch (error) {
    return createResponse(500,
        {error: `Failed to delete metadata: ${error.message}`});
  }
};
