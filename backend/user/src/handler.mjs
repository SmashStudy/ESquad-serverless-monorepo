import { DynamoDBClient, PutItemCommand, UpdateItemCommand, GetItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { CognitoIdentityProviderClient, AdminAddUserToGroupCommand, ListUsersCommand } from "@aws-sdk/client-cognito-identity-provider";
import jwt from 'jsonwebtoken';
import { createResponse } from '../util/responseHelper.mjs';
import { userRoutes } from './route/userRoutes.mjs';



const dynamoDb = new DynamoDBClient({ region: 'us-east-1' });
const cognitoClient = new CognitoIdentityProviderClient({ region: process.env.REGION });

export const saveUserToDynamoDB = async (event) => {
  try {
    const userAttributes = event.request.userAttributes;

    if (!userAttributes.email) {
      throw new Error("사용자 속성에 이메일이 없습니다.");
    }

    const email = userAttributes.email;
    const name = userAttributes.name || "No Name";
    const nickname = userAttributes.nickname || `${email.split("@")[0]}`;

    console.log(`Processing user with email: ${email}`);

    // DynamoDB에 사용자 정보 저장
    console.log(`Saving user ${email} to DynamoDB.`);
    const params = {
      TableName: process.env.USER_TABLE_NAME || "esquad-table-user-dev",
      Item: {
        email: { S: email },
        name: { S: name },
        nickname: { S: nickname },
        role: { S: "user" }, // 기본 역할 설정
        entryPoint: { SS: userRoutes },
        createdAt: { S: new Date().toISOString() },
      },
    };

    const command = new PutItemCommand(params);
    await dynamoDb.send(command);
    console.log(`User ${email} successfully saved to DynamoDB.`);

    // 사용자 그룹에 추가
    try {
      console.log(`Adding user ${email} to Cognito group.`);
      await addUserToCognitoGroupByEmail(email, "user");
    } catch (groupError) {
      console.error(`Failed to add user ${email} to Cognito group:`, groupError);
    }

    return event;
  } catch (error) {
    console.error("Error saving user to DynamoDB or adding to group:", error);
    throw error;
  }
};

// 이메일로 사용자를 검색하고 그룹에 추가하는 함수
const addUserToCognitoGroupByEmail = async (email, groupName) => {
  try {
    console.log(`Searching for user with email: ${email}`);
    const getUserParams = {
      UserPoolId: process.env.COGNITO_USER_POOL_ID, // 사용자 풀 ID
      Filter: `email = "${email}"`,
    };

    const command = new ListUsersCommand(getUserParams);
    const { Users } = await cognitoClient.send(command);

    if (!Users || Users.length === 0) {
      console.warn(`No user found in Cognito with email: ${email}`);
      return;
    }

    // 첫 번째 사용자의 Username 가져오기
    const username = Users[0].Username;
    console.log(`Found Cognito username for ${email}: ${username}`);

    // 그룹에 사용자 추가
    console.log(`Adding user ${username} to group: ${groupName}`);
    const addGroupCommand = new AdminAddUserToGroupCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID,
      Username: username, // Username은 Cognito 사용자 ID임
      GroupName: groupName,
    });

    await cognitoClient.send(addGroupCommand);
    console.log(`User ${username} successfully added to group ${groupName}`);
  } catch (error) {
    console.error(`Error adding user with email ${email} to group ${groupName}:`, error);
    throw error;
  }
};


// 닉네임 가져오기 함수
export const getUserNickname = async (event) => {
  console.log(`EVENT: ${event}`)
  try {
    if (!event.headers.Authorization) {
      throw new Error('Authorization 헤더가 없습니다');
    }

    // const authHeader = event.headers.Authorization;
    // const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    // if (!token) {
    //   throw new Error('JWT 토큰이 Authorization 헤더에 없습니다');
    // }

    // const decoded = jwt.decode(token);

    // if (!decoded || !decoded.email) {
    //   throw new Error('JWT 토큰에 email 속성이 없습니다');
    // }

    const email = String(decoded.email);
    console.log(`email: ${email}`);

    const params = {
      TableName: process.env.USER_TABLE_NAME || 'esquad-table-user-dev',
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

    return createResponse(200, {nickname});
  } catch (error) {
    console.error('닉네임 가져오기 중 오류 발생:', error);

    return createResponse(500, { message: '닉네임 가져오기 중 오류 발생', error: error.message })
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
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
      },
      body: JSON.stringify(envVariables),
    };
  } catch (error) {
    console.error('환경 변수 반환 중 오류 발생:', error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Allow-Credentials": "true",
      },
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
      TableName: process.env.USER_TABLE_NAME || 'esquad-table-user-dev',
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
      TableName: process.env.USER_TABLE_NAME || 'esquad-table-user-dev',
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

    return createResponse(200,{ message: '닉네임이 성공적으로 업데이트되었습니다', nickname: newNickname });
  } catch (error) {
    console.error('닉네임 업데이트 중 오류 발생:', error);
    return createResponse(500, { message: '닉네임 업데이트 중 오류 발생', error: error.message });
  }
};

export const getUserByEmail = async (event) => {
  try {
    console.log('Received event:', event); // 디버깅용 로그 추가

    // 이벤트에서 이메일 추출
    const body = typeof event.body === 'string' ? JSON.parse(event.body) : event.body;
    const email = body?.email;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return createResponse(400, { error: '유효한 이메일이 제공되지 않았습니다' });
    }

    const params = {
      TableName: process.env.USER_TABLE_NAME || 'esquad-table-user-dev',
      Key: {
        email: { S: email },
      },
    };

    const command = new GetItemCommand(params);
    const result = await dynamoDb.send(command);

    if (!result.Item) {
      return createResponse(404, { error: '사용자를 찾을 수 없습니다' });
    }

    // DynamoDB의 결과를 JavaScript 객체로 변환
    const user = {
      email: result.Item.email.S,
      name: result.Item.name?.S || null,
      nickname: result.Item.nickname?.S || null,
      createdAt: result.Item.createdAt?.S || null,
    };

    console.log('사용자 정보 가져오기 성공:', user);

    return createResponse(200, user);
  } catch (error) {
    console.error('이메일로 사용자 정보 가져오기 중 오류 발생:', error.message, '\nStack:', error.stack);
    return createResponse(500, { message: '이메일로 사용자 정보 가져오기 중 오류 발생', error: error.message });
  }
};

// 토큰에서 이메일을 추출하여 유저 정보 가져오기
export const getUserInfoByToken = async (event) => {
  try {
    // Authorization 헤더 확인
    if (!event.headers.Authorization) {
      throw new Error('Authorization 헤더가 없습니다');
    }

    const authHeader = event.headers.Authorization;
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      throw new Error('JWT 토큰이 Authorization 헤더에 없습니다');
    }

    // 토큰 디코딩
    const decoded = jwt.decode(token);

    if (!decoded || !decoded.email) {
      throw new Error('JWT 토큰에 email 속성이 없습니다');
    }

    const email = String(decoded.email);
    console.log(`토큰에서 추출한 이메일: ${email}`);

    // DynamoDB에서 해당 이메일의 유저 정보 가져오기
    const params = {
      TableName: process.env.USER_TABLE_NAME || 'esquad-table-user-dev',
      Key: {
        email: { S: email },
      },
    };

    const command = new GetItemCommand(params);
    const result = await dynamoDb.send(command);

    if (!result.Item) {
      throw new Error('해당 이메일로 사용자를 찾을 수 없습니다');
    }

    // 결과를 객체로 변환
    const user = {
      email: result.Item.email.S,
      name: result.Item.name?.S || null,
      nickname: result.Item.nickname?.S || null,
      createdAt: result.Item.createdAt?.S || null,
    };

    console.log('해당 이메일의 사용자 정보:', user);

    return createResponse(200, user);
  } catch (error) {
    console.error('토큰에서 이메일로 사용자 정보 가져오기 중 오류 발생:', error.message, '\nStack:', error.stack);
    return createResponse(500, { message: '토큰에서 이메일로 사용자 정보 가져오기 중 오류 발생', error: error.message });
  }
};

// JWT에서 이메일 가져오기 함수
export const getEmailFromToken = async (event) => {
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

    return createResponse(200, {email})
  } catch (error) {
    console.error('JWT에서 이메일 가져오기 중 오류 발생:', error);
    return createResponse(500, { message: 'JWT에서 이메일 가져오기 중 오류 발생', error: error.message });
  }
};
