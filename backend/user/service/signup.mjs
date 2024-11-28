import {
    CognitoIdentityProviderClient,
    SignUpCommand,
  } from "@aws-sdk/client-cognito-identity-provider";
  import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
  
  const cognitoClient = new CognitoIdentityProviderClient({
    region: process.env.REGION,
  });
  
  const dynamoDb = new DynamoDBClient({ region: process.env.REGION });
  
  export const handler = async (event) => {
    try {
      const { email, password, name, nickname } = JSON.parse(event.body);
  
      // Cognito SignUp
      const signUpCommand = new SignUpCommand({
        ClientId: process.env.COGNITO_CLIENT_ID,
        Username: email, // Cognito에서는 이메일을 사용자 이름으로 사용
        Password: password,
        UserAttributes: [
          { Name: "email", Value: email },
          { Name: "name", Value: name },
          { Name: "nickname", Value: nickname },
        ],
      });
      const cognitoResponse = await cognitoClient.send(signUpCommand);
  
      // Save user data to DynamoDB
      const dynamoParams = {
        TableName: process.env.USER_TABLE_NAME || "esquad-table-user-local",
        Item: {
          email: { S: email },
          name: { S: name },
          nickname: { S: nickname },
          createdAt: { S: new Date().toISOString() },
        },
      };
  
      const putItemCommand = new PutItemCommand(dynamoParams);
      await dynamoDb.send(putItemCommand);
  
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Credentials": true,
        },
        body: JSON.stringify({
          message: "User successfully signed up and stored in DynamoDB",
          cognitoResponse,
        }),
      };
    } catch (error) {
      console.error("Signup error:", error);
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
  