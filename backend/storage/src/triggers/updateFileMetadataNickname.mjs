import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const dynamoDb = DynamoDBDocumentClient.from(dynamoDbClient);
const METADATA_TABLE = process.env.METADATA_TABLE;

export const trigger = async (event) => {
  console.log('DynamoDB Stream event:', JSON.stringify(event, null, 2));

  for (const record of event.Records) {
    if (record.eventName === 'MODIFY') {
      const newImage = record.dynamodb.NewImage;
      const oldImage = record.dynamodb.OldImage;

      // 닉네임이 변경된 경우에만 처리
      if (newImage.nickname && oldImage.nickname && newImage.nickname.S !== oldImage.nickname.S) {
        const updatedNickname = newImage.nickname.S;
        const userEmail = newImage.email.S;

        try {
          // UserUsageIndex 인덱스를 사용하여 userEmail로 관련 파일 찾기
          const queryParams = {
            TableName: METADATA_TABLE,
            IndexName: 'UserUsageIndex',
            KeyConditionExpression: 'userEmail = :userEmail',
            ExpressionAttributeValues: {
              ':userEmail': userEmail,
            },
          };

          const data = await dynamoDb.send(new QueryCommand(queryParams));

          if (data.Items.length > 0) {
            await Promise.all(
                data.Items.map(async (item) => {
                  const updateParams = {
                    TableName: METADATA_TABLE,
                    Key: { fileKey: item.fileKey },
                    UpdateExpression: 'SET userNickname = :updatedNickname',
                    ExpressionAttributeValues: {
                      ':updatedNickname': updatedNickname,
                    },
                    ConditionExpression: 'attribute_exists(fileKey)', // fileKey가 존재하는 경우에만 업데이트
                  };
                  await dynamoDb.send(new UpdateCommand(updateParams));
                  console.log(`Updated nickname for file ${item.fileKey} to ${updatedNickname}`);
                })
            );
          }
        } catch (error) {
          console.error(`Failed to update nickname for user ${userEmail}:`, error);
        }
      }
    }
  }
};
