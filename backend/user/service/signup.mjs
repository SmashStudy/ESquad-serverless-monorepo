import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  AdminAddUserToGroupCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { DynamoDBClient, PutItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.REGION,
});

const dynamoDb = new DynamoDBClient({ region: process.env.REGION });

export const handler = async (event) => {
  try {
    // PostConfirmation 트리거에서 호출되었는지 확인
    const userAttributes = event.request?.userAttributes;
    if (userAttributes) {
      const email = userAttributes.email;
      const name = userAttributes.name || "No Name";
      const nickname = userAttributes.nickname || email.split("@")[0];

      // DynamoDB에 사용자 데이터 저장
      await saveUserToDynamoDB(email, name, nickname);

      // 사용자 역할에 따라 그룹에 추가
      await addUserToCognitoGroup(email, "user");

      // Cognito에서 예상하는 반환 값
      return event; // 반드시 event를 반환해야 함
    }

    // 일반 요청 처리 (예: API Gateway 호출)
    const { email, password, name, nickname } = JSON.parse(event.body);

    // 검증 및 기본값 설정
    const validatedName = name || "No Name"; // 기본 이름
    const validatedNickname = nickname || email.split("@")[0]; // 기본 닉네임

    // 닉네임 중복 체크
    const isNicknameTaken = await checkNicknameDuplicate(validatedNickname);
    if (isNicknameTaken) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          message: "Nickname is already taken. Please choose another one.",
        }),
      };
    }

    // Cognito SignUp
    const signUpCommand = new SignUpCommand({
      ClientId: process.env.COGNITO_CLIENT_ID,
      Username: email, // Username을 이메일로 설정
      Password: password,
      UserAttributes: [
        { Name: "email", Value: email },
        { Name: "name", Value: validatedName },
        { Name: "nickname", Value: validatedNickname },
      ],
    });

    // Cognito 요청 전송
    const cognitoResponse = await cognitoClient.send(signUpCommand);

    // DynamoDB에 사용자 데이터 저장
    await saveUserToDynamoDB(email, validatedName, validatedNickname);

    // 사용자 역할에 따라 그룹에 추가
    await addUserToCognitoGroup(email, "user");

    // 성공 응답
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: "User successfully signed up, stored in DynamoDB, and added to Cognito group",
        cognitoResponse,
      }),
    };
  } catch (error) {
    console.error("Signup error:", error);
    // Cognito 트리거에서 오류 반환
    if (event.request?.userAttributes) {
      throw new Error("PostConfirmation failed: " + error.message);
    }
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Credentials": true,
      },
      body: JSON.stringify({
        message: "Error during signup process",
        error: error.message,
      }),
    };
  }
};

// 닉네임 중복 체크 함수
const checkNicknameDuplicate = async (nickname) => {
  try {
    const params = {
      TableName: process.env.USER_TABLE_NAME || "esquad-table-user-local",
      FilterExpression: "nickname = :nickname",
      ExpressionAttributeValues: {
        ":nickname": { S: nickname },
      },
    };

    const command = new ScanCommand(params);
    const response = await dynamoDb.send(command);

    return response.Count > 0; // 중복된 닉네임이 있으면 true 반환
  } catch (error) {
    console.error("Error checking nickname duplicate:", error);
    throw error;
  }
};

// 사용자 정보를 DynamoDB에 저장하는 함수
const saveUserToDynamoDB = async (email, name, nickname) => {
  try {
    const params = {
      TableName: process.env.USER_TABLE_NAME || "esquad-table-user-local",
      Item: {
        email: { S: email },
        name: { S: name },
        nickname: { S: nickname },
        role: { S: "user" }, // 기본 역할: user
        entryPoint: { SS: ["*"] }, // 기본 엔트리 포인트
        lastLogin: { S: new Date().toISOString() }, // 로그인 시간 초기화
        lastLogout: { S: "" }, // 로그아웃 시간 초기화
        createdAt: { S: new Date().toISOString() }, // 생성 시간
      },
    };

    const putItemCommand = new PutItemCommand(params);
    await dynamoDb.send(putItemCommand);

    console.log("User successfully saved to DynamoDB:", email);
  } catch (error) {
    console.error("Error saving user to DynamoDB:", error);
    throw error;
  }
};

// Cognito 그룹에 사용자를 추가하는 함수
const addUserToCognitoGroup = async (email, groupName) => {
  try {
    const command = new AdminAddUserToGroupCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID, // 사용자 풀 ID
      Username: email,
      GroupName: groupName,
    });

    await cognitoClient.send(command);
    console.log(`User ${email} added to group ${groupName}`);
  } catch (error) {
    console.error(`Error adding user ${email} to group ${groupName}:`, error);
    throw error;
  }
};
