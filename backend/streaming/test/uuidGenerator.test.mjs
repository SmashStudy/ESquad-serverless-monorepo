import { uuid } from '../src/uuidGenerator.mjs';

describe('uuid 함수', () => {
  let consoleErrorSpy;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('UUID를 문자열로 반환해야 합니다.', () => {
    const generatedUuid = uuid();
    expect(typeof generatedUuid).toBe('string');
  });

  test('생성된 UUID가 올바른 형식을 가져야 합니다.', () => {
    const generatedUuid = uuid();
    const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    expect(uuidPattern.test(generatedUuid)).toBe(true);
  });

  test('Math.random을 사용하여 UUID를 생성해야 합니다.', () => {
    const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.5);
    const expectedUuid = '88888888-8888-4888-8888-888888888888';
    const generatedUuid = uuid();
    expect(generatedUuid).toBe(expectedUuid);
    mockRandom.mockRestore();
  });

  test('잘못된 형식의 UUID를 생성하면 오류를 던져야 합니다.', () => {
    const originalReplace = String.prototype.replace;
    String.prototype.replace = jest.fn(() => 'invalid-uuid-format');

    // Lambda 코드에서는 '생성된 UUID가 예상된 형식과 일치하지 않습니다.' 라고 에러를 던짐
    expect(() => uuid()).toThrow('생성된 UUID가 예상된 형식과 일치하지 않습니다.');

    String.prototype.replace = originalReplace;
  });

  test('UUID 생성 중 오류가 발생하면 적절한 오류를 던져야 합니다.', () => {
    const mockRandom = jest.spyOn(Math, 'random').mockImplementation(() => {
      throw new Error('Random number generator failed');
    });

    // Lambda 코드에서는 'UUID 생성에 실패했습니다: {에러메시지}' 형태로 에러를 던짐
    expect(() => uuid()).toThrow('UUID 생성에 실패했습니다: Random number generator failed');

    mockRandom.mockRestore();
  });
});
