// generatePresignedUrl.test.mjs
import AWSMock from 'aws-sdk-mock';
import AWS from 'aws-sdk';
import { requestPresignedUrl } from '../utils/s3Utils.mjs';

// AWS SDK Mock 설정
AWSMock.setSDKInstance(AWS);

describe('generatePresignedUrl Lambda Function', () => {
  beforeAll(() => {
    // S3 getSignedUrlPromise 메서드를 mock 처리
    AWSMock.mock('S3', 'getSignedUrlPromise', (operation, params, callback) => {
      if (operation === 'getObject' || operation === 'putObject' || operation === 'deleteObject') {
        callback(null, `https://s3.amazonaws.com/${params.Bucket}/${params.Key}?signed-url`);
      } else {
        callback(new Error('Invalid S3 operation'));
      }
    });
  });

  afterAll(() => {
    AWSMock.restore('S3');
  });

  it('should generate a presigned URL for getObject', async () => {
    const event = {
      body: JSON.stringify({
        action: 'getObject',
        fileKey: 'test-file.txt',
        contentType: 'text/plain',
      }),
    };

    const response = await requestPresignedUrl(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toHaveProperty('presignedUrl');
    expect(JSON.parse(response.body).presignedUrl).toContain('https://s3.amazonaws.com');
  });

  it('should generate a presigned URL for putObject', async () => {
    const event = {
      body: JSON.stringify({
        action: 'putObject',
        fileKey: 'test-file.txt',
        contentType: 'text/plain',
      }),
    };

    const response = await requestPresignedUrl(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toHaveProperty('presignedUrl');
    expect(JSON.parse(response.body).presignedUrl).toContain('https://s3.amazonaws.com');
  });

  it('should generate a presigned URL for deleteObject', async () => {
    const event = {
      body: JSON.stringify({
        action: 'deleteObject',
        fileKey: 'test-file.txt',
        contentType: 'text/plain',
      }),
    };

    const response = await requestPresignedUrl(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toHaveProperty('presignedUrl');
    expect(JSON.parse(response.body).presignedUrl).toContain('https://s3.amazonaws.com');
  });

  it('should return 500 if S3 operation is invalid', async () => {
    const event = {
      body: JSON.stringify({
        action: 'invalidAction',
        fileKey: 'test-file.txt',
        contentType: 'text/plain',
      }),
    };

    const response = await requestPresignedUrl(event);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body).error).toContain('Failed to generate presigned URL');
  });
});
