// storeFileMetadata.test.mjs
import AWSMock from 'aws-sdk-mock';
import AWS from 'aws-sdk';
import { handler } from '../service/storeFileMetadata.mjs';

// AWS SDK Mock 설정
AWSMock.setSDKInstance(AWS);

describe('storeFileMetadata Lambda Function', () => {
  beforeAll(() => {
    // DynamoDB put 메서드를 mock 처리
    AWSMock.mock('DynamoDB.DocumentClient', 'put', (params, callback) => {
      if (params.Item.id === 'validFileKey') {
        callback(null, {}); // 정상 저장 시
      } else {
        callback(new Error('Failed to store metadata')); // 오류 발생 시
      }
    });
  });

  afterAll(() => {
    AWSMock.restore('DynamoDB.DocumentClient');
  });

  it('should store file metadata successfully', async () => {
    const event = {
      body: JSON.stringify({
        fileKey: 'validFileKey',
        metadata: {
          size: '100MB',
          type: 'text/plain',
        },
      }),
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Metadata stored successfully',
      data: {
        id: 'validFileKey',
        size: '100MB',
        type: 'text/plain',
      },
    });
  });

  it('should return 500 if storing metadata fails', async () => {
    const event = {
      body: JSON.stringify({
        fileKey: 'invalidFileKey',
        metadata: {
          size: '100MB',
          type: 'text/plain',
        },
      }),
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body).error).toContain('Failed to store metadata');
  });

  it('should return 500 if event body is not valid JSON', async () => {
    const event = {
      body: 'invalid-json',
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body).error).toContain('Failed to store metadata');
  });
});
