import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { createResponse } from '../utils/responseHelper.mjs';
import { METADATA_TABLE, dynamoDb } from '../utils/dynamoUtil.mjs';

export const handler = async () => {
  console.log("Fetching all metadata from DynamoDB...");

  const params = {
    TableName: METADATA_TABLE,
  };
  let items = [];
  try {

    const data = await dynamoDb.send(new ScanCommand(params));
    items = items.concat(data.Items);

    return createResponse(200, items);
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return createResponse(500, { error: `Failed to fetch metadata : ${error.message}`})
  }

}
