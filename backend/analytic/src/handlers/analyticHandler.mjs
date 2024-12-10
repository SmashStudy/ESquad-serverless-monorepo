// 팀 핸들러 로직

import { createResponse } from '../utils/responseHelper.mjs';
import { QueryCommand, GetCommand, UpdateCommand, DeleteCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb, TEAM_TABLE } from '../utils/dynamoClient.mjs';

export const handler = async (event) => {
    const bucketName = 'team-service-local-serverlessdeploymentbucket-3wilboaeg1kz';
    const fileName = 'teamData.json';
  
    try {
      const params = {
        Bucket: bucketName,
        Key: fileName,
      };
  
      const data = await s3.getObject(params).promise();
      const jsonData = JSON.parse(data.Body.toString('utf-8'));
  
      // 필요한 데이터 처리
      const teamUsers = jsonData.teamUsers;
      const teamData = jsonData.teamData;
  
      return {
        statusCode: 200,
        body: JSON.stringify({ teamUsers, teamData }),
      };
    } catch (error) {
      console.error(error);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: '데이터 로드 실패' }),
      };
    }
  };