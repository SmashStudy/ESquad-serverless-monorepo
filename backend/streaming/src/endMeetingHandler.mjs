import { CORS_HEADERS, handleOptions } from './corsConfig.mjs';
import { deleteMeeting } from './deleteMeeting.mjs';
import { updateParticipantUsage } from './updateParticipantUsage.mjs';

export const handler = async (event) => {
  // 프리플라이트(OPTIONS) 요청 처리
  if (event.httpMethod === "OPTIONS") {
    return handleOptions();
  }

  try {
    const { title, participant, nickname } = JSON.parse(event.body);

    if (!title) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: "Title is required" }),
      };
    }

    if (!participant) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS,
        body: JSON.stringify({ message: "Participant is required" }),
      };
    }

    console.log("Ending meeting for title:", title, "with participant:", participant);


    const response = "";


    await updateParticipantUsage(title, nickname);

// participant를 전달하여 삭제 조건 적용
    if (participant === "1") {
        response = await deleteMeeting(title, participant);
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(response),
    };
  } catch (error) {
    return {
      statusCode: error.message === "Meeting not found" ? 404 : 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        message: error.message === "Meeting not found" ? "Meeting not found" : "Internal Server Error",
        error: error.message,
      }),
    };
  }
};
