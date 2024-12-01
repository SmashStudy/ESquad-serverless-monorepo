describe('putAttendee 함수 테스트', () => {
    let putAttendee;
    let putItemMock;
    let consoleLogSpy;
    let consoleErrorSpy;
  
    beforeEach(() => {
      // 필요한 모듈 초기화
      jest.resetModules();
      jest.clearAllMocks();
  
      // `putItem.mjs` 모듈을 모킹
      jest.mock('../src/putItem.mjs', () => ({
        putItem: jest.fn(),
      }));
  
      // 모킹된 `putItem` 가져오기
      putItemMock = require('../src/putItem.mjs').putItem;
  
      // 테스트 대상 함수 가져오기
      putAttendee = require('../src/putAttendee.mjs').putAttendee;
  
      // console.log와 console.error 모킹
      consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    });
  
    afterEach(() => {
      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  
    test('참가자 정보를 성공적으로 저장해야 합니다', async () => {
      const title = '테스트 회의';
      const attendeeId = 'attendee123';
      const attendeeName = '참석자1';
  
      const expectedItem = {
        attendeeId: { S: `${title}/${attendeeId}` },
        name: { S: attendeeName },
        ttl: { N: expect.any(String) }, // TTL 값은 유효한 문자열이어야 함
      };
  
      // `putItem` 모킹 설정
      putItemMock.mockResolvedValue();
  
      await putAttendee(title, attendeeId, attendeeName);
  
      // `putItem` 호출 검증
      expect(putItemMock).toHaveBeenCalledWith(process.env.ATTENDEES_TABLE_NAME, expectedItem);
  
      // 로그 호출 검증
      expect(consoleLogSpy).toHaveBeenCalledWith(`Attendee ${attendeeName} added successfully to ${title}`);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });
  
    test('DynamoDB 오류가 발생하면 예외를 던져야 합니다', async () => {
      const title = '테스트 회의';
      const attendeeId = 'attendee123';
      const attendeeName = '참석자1';
      const error = new Error('DynamoDB 오류');
  
      // `putItem` 모킹 설정 (오류 발생)
      putItemMock.mockRejectedValue(error);
  
      await expect(putAttendee(title, attendeeId, attendeeName)).rejects.toThrow('Failed to save attendee: DynamoDB 오류');
  
      // `putItem` 호출 검증
      expect(putItemMock).toHaveBeenCalledWith(process.env.ATTENDEES_TABLE_NAME, {
        attendeeId: { S: `${title}/${attendeeId}` },
        name: { S: attendeeName },
        ttl: { N: expect.any(String) },
      });
  
      // 오류 로그 호출 검증
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error saving attendee:', error);
    });
  
    test('TTL 값이 정상적으로 설정되어야 합니다', async () => {
      const title = '테스트 회의';
      const attendeeId = 'attendee123';
      const attendeeName = '참석자1';
  
      putItemMock.mockResolvedValue();
  
      await putAttendee(title, attendeeId, attendeeName);
  
      // TTL 값 확인
      const [_, item] = putItemMock.mock.calls[0];
      const ttl = parseInt(item.ttl.N, 10);
      const now = Math.floor(Date.now() / 1000);
      const oneDay = 60 * 60 * 24;
  
      expect(ttl).toBeGreaterThan(now);
      expect(ttl).toBeLessThan(now + oneDay + 10); // 약간의 허용 오차
    });
  });
  