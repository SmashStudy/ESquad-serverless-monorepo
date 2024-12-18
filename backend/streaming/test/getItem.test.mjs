import { getItem } from '../src/getItem.mjs';

// Jest를 사용하여 모듈 모킹
jest.mock('../src/getItem.mjs', () => ({
  getItem: jest.fn(),
}));

describe('getAttendee 함수 테스트', () => {
  let getAttendee;
  let consoleErrorSpy;

  beforeEach(async () => {
    jest.clearAllMocks();
    process.env.ATTENDEES_TABLE_NAME = 'AttendeesTable';
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const module = await import('../src/getAttendee.mjs');
    getAttendee = module.getAttendee;
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test('성공적으로 참가자 이름을 반환해야 합니다', async () => {
    const title = '테스트 회의';
    const attendeeId = 'attendee123';
    const fakeAttendee = {
      name: {
        S: '참석자1',
      },
    };

    getItem.mockResolvedValue(fakeAttendee);

    const result = await getAttendee(title, attendeeId);

    expect(getItem).toHaveBeenCalledWith('AttendeesTable', {
      attendeeId: { S: `${title}/${attendeeId}` },
    });

    expect(result).toBe('참석자1');
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('참가자가 존재하지 않을 때 "알 수 없음"을 반환해야 합니다', async () => {
    const title = '테스트 회의';
    const attendeeId = 'attendee123';

    getItem.mockResolvedValue(null);

    const result = await getAttendee(title, attendeeId);

    expect(getItem).toHaveBeenCalledWith('AttendeesTable', {
      attendeeId: { S: `${title}/${attendeeId}` },
    });

    expect(result).toBe('알 수 없음');
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('참가자 정보에 name 속성이 없을 때 "알 수 없음"을 반환해야 합니다', async () => {
    const title = '테스트 회의';
    const attendeeId = 'attendee123';
    const fakeAttendee = {};

    getItem.mockResolvedValue(fakeAttendee);

    const result = await getAttendee(title, attendeeId);

    expect(getItem).toHaveBeenCalledWith('AttendeesTable', {
      attendeeId: { S: `${title}/${attendeeId}` },
    });

    expect(result).toBe('알 수 없음');
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  test('DynamoDB 오류가 발생할 때 예외를 던져야 합니다', async () => {
    const title = '테스트 회의';
    const attendeeId = 'attendee123';
    const error = new Error('DynamoDB 오류');

    getItem.mockRejectedValue(error);

    await expect(getAttendee(title, attendeeId)).rejects.toThrow(
      '참가자 정보를 가져오는 데 실패했습니다: DynamoDB 오류'
    );

    expect(getItem).toHaveBeenCalledWith('AttendeesTable', {
      attendeeId: { S: `${title}/${attendeeId}` },
    });

    // 예상 메시지를 실제 코드와 일치하도록 수정
    expect(consoleErrorSpy).toHaveBeenCalledWith('참가자 정보 조회 중 오류 발생:', error);
  });

  test('참가자 정보에 name 속성이 S 속성을 갖지 않을 때 "알 수 없음"을 반환해야 합니다', async () => {
    const title = '테스트 회의';
    const attendeeId = 'attendee123';
    const fakeAttendee = {
      name: {},
    };

    getItem.mockResolvedValue(fakeAttendee);

    const result = await getAttendee(title, attendeeId);

    expect(getItem).toHaveBeenCalledWith('AttendeesTable', {
      attendeeId: { S: `${title}/${attendeeId}` },
    });

    expect(result).toBe('알 수 없음');
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
