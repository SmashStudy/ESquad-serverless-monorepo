// 테스트 실행 전에 환경 변수 설정
process.env.PARTICIPANT_USAGE_TABLE_NAME = 'TestParticipantUsageTable';

let mockSend;

// AWS SDK 모듈 mock
jest.mock("@aws-sdk/client-dynamodb", () => {
  const original = jest.requireActual("@aws-sdk/client-dynamodb");
  mockSend = jest.fn(); // 하나의 mockSend 함수 유지

  return {
    ...original,
    DynamoDBClient: jest.fn().mockImplementation(() => {
      // 항상 동일한 구조를 가진 mock 객체 반환
      return {
        send: mockSend
      };
    }),
  };
});

import { QueryCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { updateParticipantUsage } from "../src/updateParticipantUsage.mjs";

describe("updateParticipantUsage", () => {
  let consoleLogSpy;

  beforeEach(() => {
    jest.clearAllMocks();
    consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
  });

  test("title에 해당하는 레코드가 없을 때 로그 출력 후 종료", async () => {
    // QueryCommand 결과: 빈 배열
    mockSend.mockResolvedValueOnce({ Items: [] });

    await updateParticipantUsage("SomeTitle", "SomeName");

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith("해당 title에 해당하는 레코드가 없습니다.");
  });

  test("title에 대한 레코드는 있지만 해당 name을 가진 최신 레코드가 없을 때 로그 출력 후 종료", async () => {
    mockSend.mockResolvedValueOnce({
      Items: [
        { name: { S: "OtherName" }, userEmail: { S: "user@example.com" }, start_At: { S: "2024-01-01T00:00:00Z" } }
      ]
    });

    await updateParticipantUsage("SomeTitle", "SomeName");

    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(consoleLogSpy).toHaveBeenCalledWith("해당 title 및 name에 해당하는 최신 레코드를 찾지 못했습니다.");
  });

  test("해당 title, name을 가진 최신 레코드를 찾아 end_At를 업데이트 성공", async () => {
    const mockUserEmail = "test@example.com";
    const mockStartAt = "2024-01-01T00:00:00Z";

    // 첫 번째는 QueryCommand 결과
    mockSend.mockResolvedValueOnce({
      Items: [
        { name: { S: "SomeName" }, userEmail: { S: mockUserEmail }, start_At: { S: mockStartAt } },
        { name: { S: "OtherName" }, userEmail: { S: "other@example.com" }, start_At: { S: "2024-01-02T00:00:00Z" } }
      ]
    });
    // 두 번째는 UpdateItemCommand 결과
    mockSend.mockResolvedValueOnce({ Attributes: { end_At: { S: "2024-01-01T01:00:00Z" } } });

    await updateParticipantUsage("SomeTitle", "SomeName");

    // QueryCommand, UpdateItemCommand 순서 확인
    expect(mockSend).toHaveBeenCalledTimes(2);
    // 로그 출력 확인
    expect(consoleLogSpy).toHaveBeenCalledWith("end_At 업데이트 완료:", { Attributes: { end_At: { S: "2024-01-01T01:00:00Z" } } });
  });
});
