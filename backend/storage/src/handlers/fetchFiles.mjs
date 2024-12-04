import {QueryCommand} from '@aws-sdk/lib-dynamodb';
import {createResponse} from '../utils/responseHelper.mjs'
import {METADATA_TABLE, dynamoDb} from "../utils/dynamoUtil.mjs";

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);
  let {
    targetId,
    targetType,
    limit = 5,
    lastEvaluatedKey
  } = event.queryStringParameters || {};

  try {
    // 인코딩 여부에 따라 디코딩 시도
    targetId = decodeURIComponent(targetId);
  } catch (error) {
    // 이미 디코딩된 상태로 들어온 경우 아무 작업 안 함
    console.log("File name did not require decoding:", targetId);
  }

  if (!targetId) {
    return createResponse(400, {error: 'Please provide the targetId.'});
  }

  const params = {
    TableName: METADATA_TABLE,
    IndexName: 'FetchFileIndexByDate',
    KeyConditionExpression: 'targetId = :targetId',
    FilterExpression: 'targetType = :targetType',
    ExpressionAttributeValues: {
      ':targetId': targetId,
      ':targetType': targetType,
    },
    Limit: parseInt(limit, 10),
    ScanIndexForward: false, // 최신순 정렬
  };

  if (lastEvaluatedKey) {
    try {
      params.ExclusiveStartKey = JSON.parse(lastEvaluatedKey);
    } catch (err) {
      console.error("Invalid lastEvaluatedKey format:", err);
      return createResponse(400, {error: 'Invalid lastEvaluatedKey format'});
    }
  }

  try {
    const data = await dynamoDb.send(new QueryCommand(params));
    return createResponse(200, {
      items: data.Items,
      lastEvaluatedKey: data.LastEvaluatedKey ? JSON.stringify(
          data.LastEvaluatedKey) : null,
    })
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return createResponse(500,
        {error: `Failed to fetch metadata: ${error.message}`});
  }
};
