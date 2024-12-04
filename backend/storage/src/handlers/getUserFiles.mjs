import {QueryCommand} from '@aws-sdk/lib-dynamodb';
import {createResponse} from '../utils/responseHelper.mjs'
import {METADATA_TABLE, dynamoDb} from "../utils/dynamoUtil.mjs";

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);
  let {userEmail} = event.queryStringParameters || {};

  try {
    // 인코딩 여부에 따라 디코딩 시도
    userEmail = decodeURIComponent(userEmail);
  } catch (error) {
    // 이미 디코딩된 상태로 들어온 경우 아무 작업 안 함
    console.log("File name did not require decoding:", userEmail);
  }

  if (!userEmail) {
    return createResponse(400, {error: 'Please provide userEmail'});
  }

  const params = {
    TableName: METADATA_TABLE,
    IndexName: 'UserUsageIndex',
    KeyConditionExpression: 'userEmail = :userEmail',
    ExpressionAttributeValues: {
      ':userEmail': userEmail,
    },
  };

  try {
    const data = await dynamoDb.send(new QueryCommand(params));
    return createResponse(200, data.Items);
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return createResponse(500,
        {error: `Failed to fetch metadata: ${error.message}`});

  }
};
