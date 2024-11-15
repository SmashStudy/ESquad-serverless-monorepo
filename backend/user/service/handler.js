const { DynamoDBClient, PutItemCommand, UpdateItemCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');

const dynamoDb = new DynamoDBClient({ region: 'us-east-1' });

// 사용자 정보를 저장하는 함수
module.exports.saveUserToDynamoDB = async (event) => {
  try {
    const userAttributes = event.request.userAttributes;

    if (!userAttributes.email) {
      throw new Error('사용자 속성에 이메일이 없습니다');
    }

    const userId = uuidv4();
    const nickname = userAttributes.nickname || `user_${userId.slice(0, 5)}`; // 기본 닉네임 설정

    const params = {
      TableName: process.env.USER_TABLE_NAME || 'esquad-table-user',
      Item: {
        userId: { S: userId },
        email: { S: userAttributes.email },
        name: { S: userAttributes.name || `${userAttributes.given_name || ''} ${userAttributes.family_name || ''}`.trim() },
        nickname: { S: nickname }, // 닉네임 기본 값 사용
        createdAt: { S: new Date().toISOString() },
      },
    };

    const command = new PutItemCommand(params);
    await dynamoDb.send(command);

    console.log('사용자가 DynamoDB에 저장되었습니다:', params.Item);

    return event;
  } catch (error) {
    console.error('DynamoDB에 사용자 저장 중 오류 발생:', error);
    throw error;
  }
};

// 닉네임 업데이트 함수
module.exports.updateUserNickname = async (event) => {
  try {
    const { userId, nickname } = JSON.parse(event.body);

    if (!userId || !nickname || nickname.trim() === "") {
      throw new Error('요청 본문에 userId 또는 유효한 nickname이 없습니다');
    }

    // 닉네임 중복 체크
    const getParams = {
      TableName: process.env.USER_TABLE_NAME || 'esquad-table-user',
      Key: {
        userId: { S: userId },
      },
    };

    const getCommand = new GetItemCommand(getParams);
    const user = await dynamoDb.send(getCommand);

    if (!user.Item) {
      throw new Error('사용자를 찾을 수 없습니다');
    }

    // 닉네임이 이미 설정되어 있는지 확인
    if (user.Item.nickname && user.Item.nickname.S && user.Item.nickname.S.trim() !== "") {
      throw new Error('닉네임이 이미 존재합니다');
    }

    // 닉네임 업데이트
    const updateParams = {
      TableName: process.env.USER_TABLE_NAME || 'esquad-table-user',
      Key: {
        userId: { S: userId },
      },
      UpdateExpression: 'SET nickname = :nickname',
      ExpressionAttributeValues: {
        ':nickname': { S: nickname },
      },
      ConditionExpression: 'attribute_not_exists(nickname) OR nickname = :empty',
      ReturnValues: 'ALL_NEW',
    };

    const updateCommand = new UpdateItemCommand(updateParams);
    const updatedUser = await dynamoDb.send(updateCommand);

    console.log('사용자 닉네임이 업데이트되었습니다:', updatedUser.Attributes);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: '닉네임이 성공적으로 업데이트되었습니다', user: updatedUser.Attributes }),
    };
  } catch (error) {
    console.error('닉네임 업데이트 중 오류 발생:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: '닉네임 업데이트 중 오류 발생', error: error.message }),
    };
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