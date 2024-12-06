import {QueryCommand} from '@aws-sdk/lib-dynamodb';
import {createResponse} from '../utils/responseHelper.mjs'
import {LOG_TABLE, dynamoDb} from "../utils/dynamoUtil.mjs";

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);
  let {action} = event.pathParameters;

  try {
    // 인코딩 여부에 따라 디코딩 시도
    action = decodeURIComponent(action);
  } catch (error) {
    // 이미 디코딩된 상태로 들어온 경우 아무 작업 안 함
    console.log("File name did not require decoding:", action);
  }

  if (!action) {
    return createResponse(400, {error: 'Please provide the action.'});
  }

  const params = {
    TableName: LOG_TABLE,
    IndexName: 'ActionIndex',
    KeyConditionExpression: '#action = :actionValue',
    ExpressionAttributeNames:{
      '#action' : 'action',
    },
    ExpressionAttributeValues: {
      ':actionValue': action,
    },
  };

  try {
    const data = await dynamoDb.send(new QueryCommand(params));
    return createResponse(200, {
      items: data.Items
    })
  } catch (error) {
    console.error('Error fetching logs:', error);
    return createResponse(500,
        {error: `Failed to fetch logs: ${error.message}`});
  }
};
