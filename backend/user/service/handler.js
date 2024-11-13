// handler.js
const { DynamoDBClient, PutItemCommand } = require('@aws-sdk/client-dynamodb');
// const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Configure DynamoDB DocumentClient
const dynamoDb = new DynamoDBClient({ region: 'us-east-1' });
// const dynamoDb = new AWS.DynamoDB.DocumentClient({ region: 'us-east-1' });

const { jwtDecode } = require("jwt-decode");

// Function to handle Cognito Post Authentication trigger and save user data to DynamoDB
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
    // await dynamoDb.put(params).promise();
    console.log('User saved to DynamoDB:', params.Item);

    return event;
  } catch (error) {
    console.error('Error saving user to DynamoDB:', error);
    throw error;
  }
};

// Authorizer function (if needed for custom authorization logic)
module.exports.authorizer = async (event, context) => {
  // Example custom authorizer logic, if required
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
