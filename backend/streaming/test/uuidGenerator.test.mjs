import { uuid } from '../service/uuidGenerator.mjs';

describe('uuid 함수', () => {
  
  beforeEach(() => {
    // 모든 테스트 케이스에서 console.error를 모킹합니다.
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // 각 테스트 후에 모킹을 복원합니다.
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
    // Math.random을 모킹하여 예측 가능한 결과를 만듭니다.
    const mockRandom = jest.spyOn(Math, 'random').mockReturnValue(0.5);
    
    const expectedUuid = '88888888-8888-4888-8888-888888888888';
    const generatedUuid = uuid();
    expect(generatedUuid).toBe(expectedUuid);
    
    // 모킹을 복원합니다.
    mockRandom.mockRestore();
  });

  test('잘못된 형식의 UUID를 생성하면 오류를 던져야 합니다.', () => {
    // UUID 생성 로직을 모킹하여 잘못된 형식을 반환하게 합니다.
    const originalReplace = String.prototype.replace;
    String.prototype.replace = jest.fn(() => 'invalid-uuid-format');
    
    expect(() => uuid()).toThrow('Generated UUID does not match the expected format');
    
    // 모킹을 복원합니다.
    String.prototype.replace = originalReplace;
  });

  test('UUID 생성 중 오류가 발생하면 적절한 오류를 던져야 합니다.', () => {
    // Math.random을 모킹하여 예외를 발생시킵니다.
    const mockRandom = jest.spyOn(Math, 'random').mockImplementation(() => {
      throw new Error('Random number generator failed');
    });
    
    expect(() => uuid()).toThrow('Failed to generate UUID: Random number generator failed');
    
    // 모킹을 복원합니다.
    mockRandom.mockRestore();
  });

});
