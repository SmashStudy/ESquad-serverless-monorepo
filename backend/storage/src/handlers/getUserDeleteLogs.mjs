import {QueryCommand} from '@aws-sdk/lib-dynamodb';
import {createResponse} from '../utils/responseHelper.mjs'
import {dynamoDb, LOG_TABLE} from "../utils/dynamoUtil.mjs";

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);

  const body = JSON.parse(event.body);
  let uploaderEmail = body.uploaderEmail;

  if (!uploaderEmail){
    console.error("Missing uploaderEmail in queryStringParameters.");
    return createResponse(400, { error: 'Please provide the uploaderEmail.' })
  }
  try {
    // 인코딩 여부에 따라 디코딩 시도
    uploaderEmail = decodeURIComponent(uploaderEmail);
  } catch (error) {
    // 이미 디코딩된 상태로 들어온 경우 아무 작업 안 함
    console.log("uploaderEmail did not require decoding:", uploaderEmail);
  }

  if (!uploaderEmail) {
    return createResponse(400, {error: 'Please provide the targetId.'});
  }

  const params = {
    TableName: LOG_TABLE,
    IndexName: 'UploaderEmailIndex',
    KeyConditionExpression: 'uploaderEmail = :uploaderEmail',
    FilterExpression: '#action = :actionValue',
    ExpressionAttributeNames: {
      '#action' : 'action',
    },
    ExpressionAttributeValues: {
      ':uploaderEmail': uploaderEmail,
      ':actionValue': "DELETE",
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
