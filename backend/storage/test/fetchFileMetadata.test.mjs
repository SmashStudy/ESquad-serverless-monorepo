// fetchFileMetadata.test.mjs
import AWSMock from 'aws-sdk-mock';
import AWS from 'aws-sdk';
import { handler } from '../service/fetchFileMetadata.mjs';

// AWS SDK Mock 설정
AWSMock.setSDKInstance(AWS);

describe('fetchFileMetadata Lambda Function', () => {
  beforeAll(() => {
    // DynamoDB query 메서드를 mock 처리
    AWSMock.mock('DynamoDB.DocumentClient', 'query', (params, callback) => {
      if (params.ExpressionAttributeValues[':targetId'] === 'validTargetId' &&
          params.ExpressionAttributeValues[':targetType'] === 'validTargetType') {
        callback(null, { Items: [{ id: '1', name: 'Test File' }] }); // 정상 쿼리 시
      } else {
        callback(null, { Items: [] }); // 결과가 없는 경우
      }
    });
  });

  afterAll(() => {
    AWSMock.restore('DynamoDB.DocumentClient');
  });

  it('should fetch file metadata successfully', async () => {
    const event = {
      queryStringParameters: {
        targetId: 'validTargetId',
        targetType: 'validTargetType',
      },
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual([{ id: '1', name: 'Test File' }]);
  });

  it('should return 400 if targetId or targetType is missing', async () => {
    const event = {
      queryStringParameters: {
        targetId: 'validTargetId',
      },
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    expect(JSON.parse(response.body).error).toBe('Please provide both targetId and targetType.');
  });

  it('should return 200 with an empty array if no metadata is found', async () => {
    const event = {
      queryStringParameters: {
        targetId: 'invalidTargetId',
        targetType: 'invalidTargetType',
      },
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual([]);
  });

  it('should return 500 if DynamoDB query fails', async () => {
    AWSMock.remock('DynamoDB.DocumentClient', 'query', (params, callback) => {
      callback(new Error('Internal Server Error')); // 오류 발생 시
    });

    const event = {
      queryStringParameters: {
        targetId: 'validTargetId',
        targetType: 'validTargetType',
      },
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body).error).toContain('Failed to fetch metadata');
  });
});
