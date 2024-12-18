import { CORS_HEADERS, handleOptions } from "./corsConfig.mjs";
import { deleteMeeting } from "./deleteMeeting.mjs";
import { updateParticipantUsage } from "./updateParticipantUsage.mjs";

export const handler = async (event) => {
  const origin = event.headers?.origin || ""; // 요청 Origin 추출

  // 프리플라이트(OPTIONS) 요청 처리
  if (event.httpMethod === "OPTIONS") {
    return handleOptions(origin); // Origin 전달
  }

  try {
    const { title, participant, nickname } = JSON.parse(event.body);

    if (!title) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS(origin), // Origin 기반 CORS 헤더
        body: JSON.stringify({ message: "회의 제목은 필수 항목입니다." }),
      };
    }

    if (!participant) {
      return {
        statusCode: 400,
        headers: CORS_HEADERS(origin), // Origin 기반 CORS 헤더
        body: JSON.stringify({ message: "참가자 정보는 필수 항목입니다." }),
      };
    }

    console.log("회의 종료 요청 - 제목:", title, "참가자:", participant);

    let response = "";

    await updateParticipantUsage(title, nickname);

    // participant를 전달하여 삭제 조건 적용
    if (participant === "1") {
      response = await deleteMeeting(title, participant);
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS(origin), // Origin 기반 CORS 헤더
      body: JSON.stringify(response),
    };
  } catch (error) {
    return {
      statusCode: error.message === "Meeting not found" ? 404 : 500,
      headers: CORS_HEADERS(origin), // Origin 기반 CORS 헤더
      body: JSON.stringify({
        message:
          error.message === "Meeting not found"
            ? "회의를 찾을 수 없습니다."
            : "서버 내부 오류가 발생했습니다.",
        error: error.message,
      }),
    };
  }
};
