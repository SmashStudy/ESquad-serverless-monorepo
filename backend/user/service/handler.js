import { DynamoDBClient, PutItemCommand, UpdateItemCommand, GetItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

const dynamoDb = new DynamoDBClient({ region: 'us-east-1' });

// 사용자 정보를 저장하는 함수
export const saveUserToDynamoDB = async (event) => {
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
        nickname: { S: nickname },
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
export const getUserNickname = async (event) => {
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

export const myEnvironments = async (event) => {
  try {
    const envKeys = [
      'VITE_COGNITO_CLIENT_ID',
      'VITE_COGNITO_REDIRECT_URI',
      'VITE_COGNITO_LOGOUT_URI',
      'VITE_COGNITO_DOMAIN',
      'VITE_COGNITO_SCOPE',
      'VITE_COGNITO_RESPONSE_TYPE',
    ];
    
    const envVariables = {};
    envKeys.forEach((key) => {
      if (process.env[key]) {
        envVariables[key] = process.env[key];
      }
    });
    
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "http://localhost:5173",
        // "Access-Control-Allow-Origin": "https://dev.esquad.click",
        // "Access-Control-Allow-Origin": "https://www.esquad.click",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      body: JSON.stringify(envVariables),
    };
  } catch (error) {
    console.error('환경 변수 반환 중 오류 발생:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: '환경 변수 반환 중 오류 발생', error: error.message }),
    };
  }
};

export const authorizer = async (event, context) => {
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

export const updateUserNickname = async (event) => {
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

    const body = JSON.parse(event.body);
    if (!body || !body.nickname) {
      throw new Error('nickname이 요청 본문에 없습니다');
    }

    const newNickname = String(body.nickname).trim();

    if (newNickname.length === 0) {
      throw new Error('nickname이 비어있습니다');
    }

    if (newNickname.length < 2 || newNickname.length > 10) {
      throw new Error('닉네임은 2자 이상, 10자 이하여야 합니다');
    }

    const scanParams = {
      TableName: process.env.USER_TABLE_NAME || 'esquad-table-user',
      FilterExpression: 'nickname = :nickname',
      ExpressionAttributeValues: {
        ':nickname': { S: newNickname },
      },
    };

    const scanCommand = new ScanCommand(scanParams);
    const scanResult = await dynamoDb.send(scanCommand);
    if (scanResult.Count > 0) {
      throw new Error('이미 사용 중인 닉네임입니다');
    }

    const params = {
      TableName: process.env.USER_TABLE_NAME || 'esquad-table-user',
      Key: {
        email: { S: email },
      },
      UpdateExpression: 'SET nickname = :nickname',
      ExpressionAttributeValues: {
        ':nickname': { S: newNickname },
      },
      ReturnValues: 'UPDATED_NEW',
    };

    const command = new UpdateItemCommand(params);
    const result = await dynamoDb.send(command);

    console.log('업데이트 결과:', result);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: '닉네임이 성공적으로 업데이트되었습니다', nickname: newNickname }),
    };
  } catch (error) {
    console.error('닉네임 업데이트 중 오류 발생:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: '닉네임 업데이트 중 오류 발생', error: error.message }),
    };
  }
};
