// handler.js
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');

const dynamoDb = new DynamoDBClient({ region: 'us-east-1' });


module.exports.saveUserToDynamoDB = async (event, context) => {
  try {
    const userAttributes = event.request.userAttributes;

    if (!userAttributes.email) {
      throw new Error('Email is missing from the user attributes');
    }

    const userId = uuidv4();

    
    const params = {
      TableName: process.env.USER_TABLE_NAME || 'esquad-table-user',
      Item: {
        userId: { S: userId }, // 문자열 타입 지정
        email: { S: userAttributes.email },
        name: { S: userAttributes.name || `${userAttributes.given_name || ''} ${userAttributes.family_name || ''}`.trim() },
        createdAt: { S: new Date().toISOString() }, // 문자열 타입 지정
      },
    };

    const command = new PutItemCommand(params);
    await dynamoDb.send(command);
  
    console.log('User saved to DynamoDB:', params.Item);

    return event;
  } catch (error) {
    console.error('Error saving user to DynamoDB:', error);
    throw error;
  }
};


module.exports.authorizer = async (event, context) => {
  
  console.log('Authorization event:', event);
  return {
    principalId: 'user',
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: 'Allow',
          Resource: event.methodArn,
        },
      ],
    },
  };
};
