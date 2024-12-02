import { AdminAddUserToGroupCommand } from "@aws-sdk/client-cognito-identity-provider";

const addUserToGroup = async (email, groupName) => {
  const command = new AdminAddUserToGroupCommand({
    UserPoolId: process.env.COGNITO_USER_POOL_ID,
    Username: email,
    GroupName: groupName,
  });
  await cognitoClient.send(command);
};