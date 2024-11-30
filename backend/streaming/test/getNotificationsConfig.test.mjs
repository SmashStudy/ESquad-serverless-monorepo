import { jest } from '@jest/globals';

describe('getNotificationsConfig 함수 테스트', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    // 각 테스트 전에 환경 변수를 초기화합니다.
    delete process.env.USE_EVENT_BRIDGE;
    delete process.env.SQS_QUEUE_ARN;

    // console.error를 모킹하여 실제 로그를 남기지 않도록 합니다.
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // 모킹된 console.error를 복원합니다.
    consoleErrorSpy.mockRestore();
    // 모듈 캐시를 초기화하여 다음 테스트에서 다시 임포트할 수 있게 합니다.
    jest.resetModules();
  });

  test('USE_EVENT_BRIDGE가 "false"일 때 빈 객체를 반환해야 합니다', async () => {
    // 환경 변수 설정: USE_EVENT_BRIDGE를 'false'로 설정
    process.env.USE_EVENT_BRIDGE = 'false';
    // SQS_QUEUE_ARN을 설정하지 않아도 됩니다.

    // 환경 변수를 설정한 후 모듈을 동적으로 임포트합니다.
    const module = await import('../src/getNotificationsConfig.mjs');
    const { getNotificationsConfig } = module;

    const config = getNotificationsConfig();

    expect(config).toEqual({});
  });

  test('USE_EVENT_BRIDGE가 "false"가 아니고 SQS_QUEUE_ARN이 설정되어 있으면 알림 설정을 반환해야 합니다', async () => {
    // 환경 변수 설정: USE_EVENT_BRIDGE를 'true'로 설정 (useEventBridge = false)
    process.env.USE_EVENT_BRIDGE = 'true';
    process.env.SQS_QUEUE_ARN = 'arn:aws:sqs:us-east-1:123456789012:MyQueue';

    // 환경 변수를 설정한 후 모듈을 동적으로 임포트합니다.
    const module = await import('../src/getNotificationsConfig.mjs');
    const { getNotificationsConfig } = module;

    const config = getNotificationsConfig();

    expect(config).toEqual({ SqsQueueArn: 'arn:aws:sqs:us-east-1:123456789012:MyQueue' });
  });

  test('USE_EVENT_BRIDGE가 "false"가 아니고 SQS_QUEUE_ARN이 설정되어 있지 않으면 예외를 던져야 합니다', async () => {
    // 환경 변수 설정: USE_EVENT_BRIDGE를 'true'로 설정 (useEventBridge = false)
    process.env.USE_EVENT_BRIDGE = 'true';
    // SQS_QUEUE_ARN을 설정하지 않음

    // 환경 변수를 설정한 후 모듈을 동적으로 임포트하여 예외를 테스트합니다.
    await expect(import('../src/getNotificationsConfig.mjs')).rejects.toThrow('SQS_QUEUE_ARN 환경 변수가 필요하지만 설정되어 있지 않습니다.');

    // 모듈 로드 시점의 예외는 getNotificationsConfig 함수 내부에서 발생하지 않으므로,
    // console.error는 호출되지 않습니다. 따라서 이를 확인할 필요가 없습니다.
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
