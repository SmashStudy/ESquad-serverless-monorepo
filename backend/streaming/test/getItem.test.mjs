import { getItem } from '../src/getItem.mjs';

// Jest를 사용하여 모듈 모킹
jest.mock('../src/getItem.mjs', () => ({
  getItem: jest.fn(),
}));

describe('getAttendee 함수 테스트', () => {
  let getAttendee;
  let consoleErrorSpy;

  // 각 테스트 전에 모킹 초기화, 환경 변수 설정, console.error 모킹
  beforeEach(async () => {
    jest.clearAllMocks();

    // 환경 변수 설정
    process.env.ATTENDEES_TABLE_NAME = 'AttendeesTable';

    // console.error 모킹
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    // getAttendee 모듈 동적 임포트 (환경 변수 설정 후)
    const module = await import('../src/getAttendee.mjs');
    getAttendee = module.getAttendee;
  });

  // 각 테스트 후에 console.error 원래대로 복구
  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('성공적으로 참가자 이름을 반환해야 합니다', async () => {
    const title = '테스트 회의';
    const attendeeId = 'attendee123';
    const fakeAttendee = {
      name: { // 'Name'에서 'name'으로 변경
        S: '참석자1',
      },
    };

    // 모킹된 함수의 반환 값 설정
    getItem.mockResolvedValue(fakeAttendee);

    const result = await getAttendee(title, attendeeId);

    // getItem 호출 검증
    expect(getItem).toHaveBeenCalledWith('AttendeesTable', {
      attendeeId: { S: `${title}/${attendeeId}` },
    });

    // 반환 값 검증
    expect(result).toBe('참석자1');

    // console.error가 호출되지 않았는지 검증
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('참가자가 존재하지 않을 때 "Unknown"을 반환해야 합니다', async () => {
    const title = '테스트 회의';
    const attendeeId = 'attendee123';

    // 모킹된 함수의 반환 값 설정
    getItem.mockResolvedValue(null);

    const result = await getAttendee(title, attendeeId);

    // getItem 호출 검증
    expect(getItem).toHaveBeenCalledWith('AttendeesTable', {
      attendeeId: { S: `${title}/${attendeeId}` },
    });

    // 반환 값 검증
    expect(result).toBe('Unknown');

    // console.error가 호출되지 않았는지 검증
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('참가자 정보에 name 속성이 없을 때 "Unknown"을 반환해야 합니다', async () => {
    const title = '테스트 회의';
    const attendeeId = 'attendee123';
    const fakeAttendee = {
      // name 속성이 없음
    };

    // 모킹된 함수의 반환 값 설정
    getItem.mockResolvedValue(fakeAttendee);

    const result = await getAttendee(title, attendeeId);

    // getItem 호출 검증
    expect(getItem).toHaveBeenCalledWith('AttendeesTable', {
      attendeeId: { S: `${title}/${attendeeId}` },
    });

    // 반환 값 검증
    expect(result).toBe('Unknown');

    // console.error가 호출되지 않았는지 검증
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('DynamoDB 오류가 발생할 때 예외를 던져야 합니다', async () => {
    const title = '테스트 회의';
    const attendeeId = 'attendee123';
    const error = new Error('DynamoDB 오류');

    // getItem의 반환 값 설정 (오류 발생)
    getItem.mockRejectedValue(error);

    // 오류 발생 여부 및 메시지 검증
    await expect(getAttendee(title, attendeeId)).rejects.toThrow(
      'Failed to retrieve attendee: DynamoDB 오류'
    );

    // getItem 호출 검증
    expect(getItem).toHaveBeenCalledWith('AttendeesTable', {
      attendeeId: { S: `${title}/${attendeeId}` },
    });

    // console.error 호출 검증
    expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching attendee:', error);
  });

  test('참가자 정보에 name 속성이 S 속성을 갖지 않을 때 "Unknown"을 반환해야 합니다', async () => {
    const title = '테스트 회의';
    const attendeeId = 'attendee123';
    const fakeAttendee = {
      name: {
        // S 속성이 없음
      },
    };

    // 모킹된 함수의 반환 값 설정
    getItem.mockResolvedValue(fakeAttendee);

    const result = await getAttendee(title, attendeeId);

    // getItem 호출 검증
    expect(getItem).toHaveBeenCalledWith('AttendeesTable', {
      attendeeId: { S: `${title}/${attendeeId}` },
    });

    // 반환 값 검증
    expect(result).toBe('Unknown');

    // console.error가 호출되지 않았는지 검증
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
