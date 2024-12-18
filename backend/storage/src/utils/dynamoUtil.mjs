import {DynamoDBClient} from '@aws-sdk/client-dynamodb';
import {DynamoDBDocumentClient} from '@aws-sdk/lib-dynamodb';

const dynamoDbClient = new DynamoDBClient({region: process.env.AWS_REGION});

export const dynamoDb = DynamoDBDocumentClient.from(dynamoDbClient);
export const METADATA_TABLE = process.env.METADATA_TABLE;
export const LOG_TABLE = process.env.FILE_LOG_TABLE;
