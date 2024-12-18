import { jest } from '@jest/globals';
import { handler } from '../src/joinMeetingHandler.mjs';
import * as meetingService from '../src/getMeeting.mjs';
import * as createMeetingService from '../src/createMeeting.mjs';
import * as createAttendeeService from '../src/createAttendee.mjs';
import * as corsConfig from '../src/corsConfig.mjs';

// 모듈 Mock 처리
jest.mock('../src/getMeeting.mjs', () => ({
  getMeeting: jest.fn(),
}));
jest.mock('../src/createMeeting.mjs', () => ({
  createMeeting: jest.fn(),
}));
jest.mock('../src/createAttendee.mjs', () => ({
  createAttendee: jest.fn(),
}));
jest.mock('../src/corsConfig.mjs', () => ({
  handleOptions: jest.fn(),
  CORS_HEADERS: { 'Content-Type': 'application/json' },
}));

describe('joinMeetingHandler 테스트', () => {
  beforeAll(() => {
    process.env.SQS_QUEUE_ARN = 'arn:aws:sqs:us-east-1:123456789012:my-queue';
    process.env.USE_EVENT_BRIDGE = 'false';
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('OPTIONS 요청을 처리해야 합니다.', async () => {
    corsConfig.handleOptions.mockReturnValue({
      statusCode: 200,
      headers: corsConfig.CORS_HEADERS,
      body: null,
    });

    const event = { httpMethod: 'OPTIONS' };
    const response = await handler(event);

    expect(corsConfig.handleOptions).toHaveBeenCalled();
    expect(response).toEqual({
      statusCode: 200,
      headers: corsConfig.CORS_HEADERS,
      body: null,
    });
  });

  test('title이 누락된 경우 400을 반환해야 합니다.', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ attendeeName: 'John Doe' }),
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    expect(response.headers).toEqual(corsConfig.CORS_HEADERS);
    expect(JSON.parse(response.body)).toEqual({
      message: '회의 제목과 참가자 이름을 제공해야 합니다.',
    });
  });

  test('attendeeName이 누락된 경우 400을 반환해야 합니다.', async () => {
    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({ title: 'Test Meeting' }),
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(400);
    expect(response.headers).toEqual(corsConfig.CORS_HEADERS);
    expect(JSON.parse(response.body)).toEqual({
      message: '회의 제목과 참가자 이름을 제공해야 합니다.',
    });
  });

  test('기존 미팅이 없는 경우 새로운 미팅을 생성해야 합니다.', async () => {
    meetingService.getMeeting.mockResolvedValue(null);
    createMeetingService.createMeeting.mockResolvedValue({
      Meeting: { MeetingId: 'new-meeting-id' },
    });
    createAttendeeService.createAttendee.mockResolvedValue({
      Attendee: { AttendeeId: 'new-attendee-id' },
    });

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({
        title: 'New Meeting',
        attendeeName: 'John Doe',
        region: 'us-east-1',
        ns_es: 'extra-data',
        userEmail: 'john@example.com',
        teamId: 'team-123',
        status: 'active'
      }),
    };

    const response = await handler(event);

    expect(meetingService.getMeeting).toHaveBeenCalledWith('New Meeting');
    // 실제 코드에서는 createMeeting을 호출할 때 (title, attendeeName, region, ns_es, userEmail, teamId, status) 순서로 인자를 넘김
    expect(createMeetingService.createMeeting).toHaveBeenCalledWith(
      'New Meeting',
      'John Doe',
      'us-east-1',
      'extra-data',
      'john@example.com',
      'team-123',
      'active'
    );
    // createAttendee는 (title, MeetingId, attendeeName, userEmail, teamId) 순으로 인자를 받음
    expect(createAttendeeService.createAttendee).toHaveBeenCalledWith(
      'New Meeting',
      'new-meeting-id',
      'John Doe',
      'john@example.com',
      'team-123'
    );

    expect(response.statusCode).toBe(200);
    expect(response.headers).toEqual(corsConfig.CORS_HEADERS);
    expect(JSON.parse(response.body)).toEqual({
      JoinInfo: {
        Title: 'New Meeting',
        Meeting: { MeetingId: 'new-meeting-id' },
        Attendee: { AttendeeId: 'new-attendee-id' },
      },
    });
  });

  test('기존 미팅이 있는 경우 해당 미팅을 재사용해야 합니다.', async () => {
    meetingService.getMeeting.mockResolvedValue({
      Meeting: { MeetingId: 'existing-meeting-id' },
    });
    createAttendeeService.createAttendee.mockResolvedValue({
      Attendee: { AttendeeId: 'existing-attendee-id' },
    });

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({
        title: 'Existing Meeting',
        attendeeName: 'John Doe',
        userEmail: 'john@example.com',
        teamId: 'team-123'
      }),
    };

    const response = await handler(event);

    expect(meetingService.getMeeting).toHaveBeenCalledWith('Existing Meeting');
    expect(createMeetingService.createMeeting).not.toHaveBeenCalled();
    expect(createAttendeeService.createAttendee).toHaveBeenCalledWith(
      'Existing Meeting',
      'existing-meeting-id',
      'John Doe',
      'john@example.com',
      'team-123'
    );

    expect(response.statusCode).toBe(200);
    expect(response.headers).toEqual(corsConfig.CORS_HEADERS);
    expect(JSON.parse(response.body)).toEqual({
      JoinInfo: {
        Title: 'Existing Meeting',
        Meeting: { MeetingId: 'existing-meeting-id' },
        Attendee: { AttendeeId: 'existing-attendee-id' },
      },
    });
  });

  test('내부 서버 오류가 발생한 경우 500을 반환해야 합니다.', async () => {
    meetingService.getMeeting.mockRejectedValue(new Error('Internal DB Error'));

    const event = {
      httpMethod: 'POST',
      body: JSON.stringify({
        title: 'Error Meeting',
        attendeeName: 'John Doe',
      }),
    };

    const response = await handler(event);

    expect(response.statusCode).toBe(500);
    expect(response.headers).toEqual(corsConfig.CORS_HEADERS);
    expect(JSON.parse(response.body)).toEqual({
      message: '서버 내부 오류가 발생했습니다.',
      error: 'Internal DB Error',
    });
  });
});
