import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import {
  CognitoIdentityProviderClient,
  AdminListGroupsForUserCommand,
  AdminGetUserCommand
} from "@aws-sdk/client-cognito-identity-provider";
import { adminRoutes } from "./route/adminRoutes.mjs";
import { userRoutes } from "./route/userRoutes.mjs";

const dynamoDb = new DynamoDBClient({ region: "us-east-1" });
const cognitoClient = new CognitoIdentityProviderClient({ region: "us-east-1" });

export const handler = async (event) => {
  try {
    console.log("PostAuthentication event:", event);

    const email = event.request.userAttributes.email;
    const username = event.userName;
    
    if (!email) {
      throw new Error("사용자의 이메일이 없습니다.");
    }

    // Cognito AdminListGroupsForUserCommand를 사용하여 그룹 정보 가져오기
    const groupsCommand = new AdminListGroupsForUserCommand({
      UserPoolId: process.env.COGNITO_USER_POOL_ID, // 사용자 풀 ID
      Username: username,
    });
    const groupResponse = await cognitoClient.send(groupsCommand);

    // 사용자가 속한 그룹 추출
    const groups = groupResponse.Groups.map((group) => group.GroupName);
    console.log(`User ${email} belongs to groups:`, groups);

    // 그룹 정보 기반으로 역할 설정
    const newRole = groups.includes("admin") ? "admin" : "user";

    // 사용자 역할에 따라 엔트리 포인트 설정
    const isAdmin = newRole === "admin";
    const updatedEntryPoints = isAdmin
      ? [...userRoutes, ...adminRoutes]
      : userRoutes;

    // DynamoDB 업데이트
    const params = {
      TableName: process.env.USER_TABLE_NAME || "esquad-table-user-local",
      Key: {
        email: { S: email },
      },
      UpdateExpression: "SET #rl = :role, entryPoint = :entryPoint",
      ExpressionAttributeNames: {
        "#rl": "role",
      },
      ExpressionAttributeValues: {
        ":role": { S: newRole },
        ":entryPoint": { SS: updatedEntryPoints },
      },
    };

    await dynamoDb.send(new UpdateItemCommand(params));
    console.log("User role and entry points updated successfully:", email);

    // Cognito 트리거는 성공 시 event를 반환
    return event;
  } catch (error) {
    console.error("PostAuthentication 트리거에서 오류 발생:", error);

    // Cognito Lambda 트리거의 경우 오류 시 이벤트를 반환해야 합니다.
    throw error;
  }
};