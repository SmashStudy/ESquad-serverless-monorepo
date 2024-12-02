import { DynamoDB } from '@aws-sdk/client-dynamodb';

let ddb;
try {
  // DynamoDB 클라이언트 초기화
  ddb = new DynamoDB({
    region: 'us-east-1', // 버지니아 북부 리전으로 설정
  });
} catch (error) {
  // 예외 처리: DynamoDB 클라이언트 초기화 오류
  console.error('DynamoDB 클라이언트 초기화 중 오류 발생:', error);
  throw new Error('DynamoDB 클라이언트를 초기화할 수 없습니다.');
}

export { ddb };
