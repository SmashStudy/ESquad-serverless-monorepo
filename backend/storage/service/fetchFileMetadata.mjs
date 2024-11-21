import AWS from 'aws-sdk';

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = process.env.METADATA_TABLE;

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);
  const {
    targetId,
    targetType,
    limit = 5,
    lastEvaluatedKey
  } = event.queryStringParameters || {};

  if (!targetId) {
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE',
      },
      statusCode: 400,
      body: JSON.stringify({error: 'Please provide the targetId.'}),
    };
  }

  const params = {
    TableName: TABLE_NAME,
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
  console.log(`lastEvaluatedKey is ${lastEvaluatedKey}`)
  if (lastEvaluatedKey) {
    try {
      params.ExclusiveStartKey = JSON.parse(lastEvaluatedKey);
      // params.ExclusiveStartKey = lastEvaluatedKey;
    } catch (err) {
      console.error("Invalid lastEvaluatedKey format:", err);
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,Authorization',
          'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE',
        },
        body: JSON.stringify({error: 'Invalid lastEvaluatedKey format'}),
      };
    }
  }

  try {
    const data = await dynamoDb.query(params).promise();
    return {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE',
      },
      statusCode: 200,
      body: JSON.stringify({
        items: data.Items,
        lastEvaluatedKey: data.LastEvaluatedKey ? JSON.stringify(
            data.LastEvaluatedKey) : null,
      }),
    };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,Authorization',
        'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,DELETE',
      },
      body: JSON.stringify(
          {error: `Failed to fetch metadata: ${error.message}`}),
    };
  }
};
