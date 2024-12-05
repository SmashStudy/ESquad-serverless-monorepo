// BASE_URL을 배포된 API Gateway URL로 수정
// export const BASE_URL = 'https://api.esquad.click/dev/';

// import routes from '../constants/routes';
// export const BASE_URL = routes.HOME;

import routes from '../constants/routes';

const isProduction = process.env.NODE_ENV === 'production';

export const BASE_URL = isProduction ? 'https://api.esquad.click/dev/' : routes.HOME;


export type MeetingFeatures = {
  Audio: { [key: string]: string };
};

export type CreateMeetingResponse = {
  MeetingFeatures: MeetingFeatures;
  MediaRegion: string;
};

export type JoinMeetingInfo = {
  Meeting: CreateMeetingResponse;
  Attendee: string;
};

interface MeetingResponse {
  JoinInfo: JoinMeetingInfo;
}

interface GetAttendeeResponse {
  name: string;
}

export async function createMeetingAndAttendee(
  title: string,
  attendeeName: string,
  region: string,
  echoReductionCapability = false,
  userEmail: string,
  teamId: string
): Promise<MeetingResponse> {
  const body = {
    title: encodeURIComponent(title),
    attendeeName: attendeeName,
    region: encodeURIComponent(region),
    ns_es: String(echoReductionCapability),
    userEmail: userEmail,
    teamId: teamId,
  };

  // API Gateway URL로 요청을 보냄
  const res = await fetch(BASE_URL + 'stream/join', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  if (data.error) {
    throw new Error(`Server error: ${data.error}`);
  }

  return data;
}

export async function getAttendee(
  title: string,
  attendeeId: string
): Promise<GetAttendeeResponse> {
  const params = {
    title: encodeURIComponent(title),
    attendeeId: encodeURIComponent(attendeeId),
  };

  const res = await fetch(
    BASE_URL + 'stream/attendee?' + new URLSearchParams(params),
    {
      method: 'GET',
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Server error: ${res.status} - ${errorText}`);
  }

  const data = await res.json();

  return {
    name: data.Name,
  };
}


export async function endMeeting(title: string): Promise<void> {
  const body = {
    title: encodeURIComponent(title),
  };

  const res = await fetch(BASE_URL + 'stream/end', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error('Server error ending meeting');
  }
}

export const createGetAttendeeCallback = (meetingId: string) => (
  chimeAttendeeId: string
): Promise<GetAttendeeResponse> => getAttendee(meetingId, chimeAttendeeId);

