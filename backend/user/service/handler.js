const { DynamoDBClient, PutItemCommand, UpdateItemCommand, GetItemCommand } = require('@aws-sdk/client-dynamodb');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');

const dynamoDb = new DynamoDBClient({ region: 'us-east-1' });

// 사용자 정보를 저장하는 함수
module.exports.saveUserToDynamoDB = async (event) => {
  try {
    const userAttributes = event.request.userAttributes;

    if (!userAttributes.email) {
      throw new Error('사용자 속성에 이메일이 없습니다');
    }

    const email = userAttributes.email;
    const nickname = userAttributes.nickname || `${email.split('@')[0]}`; // 기본 닉네임 설정

    const params = {
      TableName: process.env.USER_TABLE_NAME || 'esquad-table-user',
      Item: {
        email: { S: email },
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

// 닉네임 가져오기 함수
module.exports.getUserNickname = async (event) => {
  try {
    if (!event.headers.Authorization) {
      throw new Error('Authorization 헤더가 없습니다');
    }

    const authHeader = event.headers.Authorization;
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      throw new Error('JWT 토큰이 Authorization 헤더에 없습니다');
    }

    const decoded = jwt.decode(token);

    if (!decoded || !decoded.email) {
      throw new Error('JWT 토큰에 email 속성이 없습니다');
    }

    const email = String(decoded.email);
    console.log(`email: ${email}`);

    const params = {
      TableName: process.env.USER_TABLE_NAME || 'esquad-table-user',
      Key: {
        email: { S: email },
      },
    };

    const command = new GetItemCommand(params);
    const user = await dynamoDb.send(command);

    if (!user.Item) {
      throw new Error('사용자를 찾을 수 없습니다');
    }

    const nickname = user.Item.nickname ? user.Item.nickname.S : null;

    if (!nickname) {
      throw new Error('사용자 닉네임이 없습니다');
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ nickname }),
    };
  } catch (error) {
    console.error('닉네임 가져오기 중 오류 발생:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: '닉네임 가져오기 중 오류 발생', error: error.message }),
    };
  }
};
