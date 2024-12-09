import {QueryCommand} from '@aws-sdk/lib-dynamodb';
import {createResponse} from '../utils/responseHelper.mjs'
import {dynamoDb, LOG_TABLE} from "../utils/dynamoUtil.mjs";

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);

  let {userEmail} = event.queryStringParameters || {};

  // const body = JSON.parse(event.body);
  // let userEmail = body.userEmail;
  //
  if (!userEmail){
    console.error("Missing userEmail in queryStringParameters.");
    return createResponse(400, { error: 'Please provide the userEmail.' })
  }

  try {
    // 인코딩 여부에 따라 디코딩 시도
    userEmail = decodeURIComponent(userEmail);
  } catch (error) {
    // 이미 디코딩된 상태로 들어온 경우 아무 작업 안 함
    console.log("userEmail did not require decoding:", userEmail);
  }

  if (!userEmail) {
    return createResponse(400, {error: 'Please provide the targetId.'});
  }

  const params = {
    TableName: LOG_TABLE,
    IndexName: 'UserEmailIndex',
    KeyConditionExpression: 'userEmail = :userEmail',
    FilterExpression: '#action = :actionValue',
    ExpressionAttributeNames: {
      '#action' : 'action',
    },
    ExpressionAttributeValues: {
      ':userEmail': userEmail,
      ':actionValue': "DOWNLOAD",
    },
  };

  try {
    const data = await dynamoDb.send(new QueryCommand(params));
    return createResponse(200,
        data.Items,
    )
  } catch (error) {
    console.error('Error querying DynamoDB:', error);
    return createResponse(500, { error: `Failed to query DynamoDB: ${error.message}` });
  }
};
