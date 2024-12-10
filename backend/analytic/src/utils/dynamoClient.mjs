// DynamoDB 클라이언트와 테이블 설정 (환경 변수 사용)

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

export const dynamoDb = new DynamoDBClient({ region: process.env.REGION });
export const TEAM_TABLE = process.env.TEAM_TABLE;