import {
  AdminGetUserCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import axios from "axios";
import jwt from "jsonwebtoken";
import moment from "moment";

import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { DeleteCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const dynamodbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION,
});

const USER_POOL_ID = process.env.USER_POOL_ID;
const COGNITO_ISSUER = `https://${process.env.COGNITO_IDP}.${process.env.AWS_REGION}.amazonaws.com/${USER_POOL_ID}`;
const CONNECTIONS_TABLE = process.env.NOTIFICATION_CONNECTIONS_DYNAMODB_TABLE;
const NOTIFICATION_CONNECTION_USER_INDEX =
  process.env.NOTIFICATION_WEBSOCKET_CONNECTION_USER_INDEX;

let jwksCache = null; // JWKS 키 캐시

// Cognito의 JWKS 키를 가져오는 함수
const getJwks = async () => {
  if (jwksCache) return jwksCache; // 캐시된 키가 있으면 반환

  const jwksUrl = `${COGNITO_ISSUER}/.well-known/jwks.json`;
  const { data } = await axios.get(jwksUrl);
  jwksCache = data.keys; // 키 캐싱
  return jwksCache;
};

// JWT 토큰을 검증
const verifyJwt = async (token) => {
  const jwks = await getJwks(); // JWKS 키 가져오기
  const decodedHeader = jwt.decode(token, { complete: true });
  console.log(`decodedHeader: ${JSON.stringify(decodedHeader)}`);

  if (!decodedHeader || !decodedHeader.header.kid) {
    throw new Error("Invalid JWT header");
  }

  const key = jwks.find((k) => k.kid === decodedHeader.header.kid);
  if (!key) {
    throw new Error("Matching JWKS key not found");
  }

  const publicKey = `-----BEGIN PUBLIC KEY-----\n${key.x5c[0]}\n-----END PUBLIC KEY-----`;
  return jwt.verify(token, publicKey, { issuer: COGNITO_ISSUER }); // 토큰 검증
};

// Cognito에서 사용자 정보를 가져오는 함수
const getUserInfo = async (email) => {
  const command = new AdminGetUserCommand({
    UserPoolId: USER_POOL_ID,
    email: email,
  });

  const response = await cognitoClient.send(command);
  console.log(`response: ${JSON.stringify(response)}`);

  const attributes = response.UserAttributes.reduce((acc, attr) => {
    acc[attr.Name] = attr.Value;
    return acc;
  }, {});

  return {
    username: response.Username,
    attributes,
  };
};

// 클라이언트 연결 요청 처리
export const handler = async (event) => {
  console.log(`EVENT: \n${JSON.stringify(event, null, 2)}`); // 이벤트 로그 출력

  let userId = event.queryStringParameters?.userId;
  userId = decodeURIComponent(userId);

  if (!userId)
    throw new Error("userId query parameter is required for $connect");

  const token = event.queryStringParameters?.token;

  if (!token) {
    console.error("JWT token is missing");
    return {
      statusCode: 401,
      body: JSON.stringify({ error: "JWT token is required" }),
    };
  }

  try {
    // JWT 토큰 검증
    const decoded = await verifyJwt(token);
    console.log("JWT token verified successfully:", decoded);

    const userId = decoded.sub; // Unique identifier for the user
    console.log(`Fetching user information for userId: ${userId}`);

    // Retrieve user information from Cognito
    const userInfo = await getUserInfo(userId);
    console.log("User information retrieved successfully:", userInfo);

    // Check if the user already has a connection
    const queryParams = {
      TableName: CONNECTIONS_TABLE,
      IndexName: NOTIFICATION_CONNECTION_USER_INDEX,
      KeyConditionExpression: "userId = :userId", // GSI의 파티션 키(userId)와 비교하는 조건식
      ExpressionAttributeValues: {
        ":userId": { S: userId },
      },
    };

    const result = await dynamodbClient.send(new QueryCommand(queryParams));
    const connections = result.Items || [];

    if (connections.length === 0) {
      console.log(`No existing connections found for userId: ${userId}`);
    } else {
      for (const connection of connections) {
        const deleteParams = {
          TableName: CONNECTIONS_TABLE,
          Key: {
            connectionId: connection.connectionId.S,
          },
        };

        await dynamodbClient.send(new DeleteCommand(deleteParams));
        console.log(`Deleted connectionId: ${connection.connectionId.S}`);
      }
    }

    // TTL 값 계산 (1시간 후에 만료되는 항목으로 설정)
    const ttl = Math.floor(Date.now() / 1000) + 3600; // 현재 시간 + 3600초 (1시간)

    // 연결 정보를 DynamoDB에 저장
    const putParams = {
      TableName: CONNECTIONS_TABLE,
      Item: {
        connectionId: event.requestContext.connectionId,
        userId: userId,
        timestamp: moment().valueOf(),
        ttl: ttl,
      },
    };

    await dynamodbClient.send(new PutCommand(putParams));
    return {
      isBase64Encoded: true,
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error while connecting WebSocket event:", error);
    return {
      isBase64Encoded: true,
      statusCode: 500,
      body: JSON.stringify({
        error: "Internal error occurred while connecting socket",
      }),
    };
  }
};
