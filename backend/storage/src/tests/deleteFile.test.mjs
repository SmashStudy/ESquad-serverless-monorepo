// deleteFile.test.mjs
import AWSMock from 'aws-sdk-mock';
import AWS from 'aws-sdk';
import { handler } from '../handlers/deleteFile.mjs';

// AWS SDK Mock 설정
AWSMock.setSDKInstance(AWS);

describe('deleteFile Lambda Function', () => {
  beforeAll(() => {
    // DynamoDB delete 메서드를 mock 처리
    AWSMock.mock('DynamoDB.DocumentClient', 'delete', (params, callback) => {
      if (params.Key.id === 'files/test-file.txt') {
        callback(null, {}); // 정상 삭제 시
      } else {
        callback(new Error('File not found')); // 오류 시
      }
    });
  });

  afterAll(() => {
    AWSMock.restore('DynamoDB.DocumentClient');
  });

  it('should delete file metadata successfully', async () => {
    const event = {
      pathParameters: {
        storedFileName: 'test-file.txt',
      },
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toEqual({
      message: 'Metadata for test-file.txt deleted successfully',
    });
  });

  it('should return 500 if file deletion fails', async () => {
    const event = {
      pathParameters: {
        storedFileName: 'non-existent-file.txt',
      },
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body).error).toContain('Failed to delete metadata');
  });

  it('should handle already decoded filenames correctly', async () => {
    const event = {
      pathParameters: {
        storedFileName: 'already-decoded-file.txt',
      },
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(500);
    expect(JSON.parse(response.body).error).toContain('Failed to delete metadata');
  });
});
