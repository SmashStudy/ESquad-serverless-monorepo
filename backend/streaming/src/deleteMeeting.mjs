import { chimeSDKMeetings } from './chimeMeetingsClient.mjs';
import { getMeeting } from './getMeeting.mjs';
import { ddb } from './dynamoClient.mjs';
import { DeleteItemCommand, QueryCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const meetingsTableName = process.env.MEETINGS_TABLE_NAME;
const meetingsRoomUsageTableName = process.env.MEETING_ROOM_USAGE_TABLE_NAME;

/**
 * 회의를 삭제하고 회의실 사용 추적을 업데이트합니다.
 * 
 * @param {string} title - 삭제할 회의의 제목.
 * @param {string} participant - 삭제 권한이 있는 참가자 여부("1"이면 삭제 권한 있음)
 * @returns {Object} - 삭제 및 업데이트 성공 메시지.
 * @throws {Error} - 오류 발생 시
 */
export const deleteMeeting = async (title, participant) => {
  try {
    // 1. 회의 정보 조회
    const meetingInfo = await getMeeting(title);

    // 2. 회의 존재 여부 확인
    if (!meetingInfo) {
      throw new Error("회의를 찾을 수 없습니다.");
    }

    // 3. Chime 회의 삭제
    await chimeSDKMeetings.deleteMeeting({
      MeetingId: meetingInfo.Meeting.MeetingId,
    });
    console.log(`회의 "${title}"이(가) Chime에서 성공적으로 삭제되었습니다.`);

    // 4. 참가자가 삭제 권한이 있는 경우 DynamoDB에서 삭제 진행
    if (participant === "1") {
      // 4.1 meetingsTableName에서 회의 삭제
      const deleteParams = {
        TableName: meetingsTableName,
        Key: {
          title: { S: title },
        },
      };

      const deleteCommand = new DeleteItemCommand(deleteParams);
      await ddb.send(deleteCommand);

      console.log(`회의 "${title}"이(가) DynamoDB 테이블 "${meetingsTableName}"에서 제거되었습니다.`);

      // 4.2 meetingsRoomUsageTableName에서 최신 사용 기록 업데이트
      const queryParams = {
        TableName: meetingsRoomUsageTableName,
        KeyConditionExpression: "title = :title",
        ExpressionAttributeValues: {
          ":title": { S: title },
        },
        ScanIndexForward: false, // 내림차순 정렬로 최신 항목 먼저 조회
        Limit: 1, // 가장 최근 항목 하나만 조회
      };

      const queryCommand = new QueryCommand(queryParams);
      const queryResult = await ddb.send(queryCommand);

      if (queryResult.Items && queryResult.Items.length > 0) {
        const latestUsage = queryResult.Items[0];
        const usageKey = {
          title: latestUsage.title,
          start_At: latestUsage.start_At,
        };

        const updateParams = {
          TableName: meetingsRoomUsageTableName,
          Key: usageKey,
          UpdateExpression: "SET end_At = :endAt, #st = :status",
          ExpressionAttributeValues: {
            ":endAt": { S: new Date().toISOString() },
            ":status": { S: "false" },
          },
          ExpressionAttributeNames: {
            "#st": "status", // 'status'는 DynamoDB의 예약어이므로 별칭 사용
          },
        };

        const updateCommand = new UpdateItemCommand(updateParams);
        await ddb.send(updateCommand);

        console.log(`회의실 사용 기록이 "${title}"에 대해 end_At과 status=false로 업데이트되었습니다.`);
      } else {
        console.warn(`회의 "${title}"에 대한 사용 기록이 테이블 "${meetingsRoomUsageTableName}"에 존재하지 않습니다.`);
      }
    }

    return { message: "회의가 성공적으로 삭제되고 회의실 사용이 업데이트되었습니다." };
  } catch (error) {
    console.error("회의 삭제 및 회의실 사용 업데이트 중 오류 발생:", error);

    if (error.message.includes("회의를 찾을 수 없습니다.")) {
      throw new Error("회의를 찾을 수 없습니다.");
    }

    if (error.message.includes("BadRequestException")) {
      throw new Error("회의 삭제 요청이 잘못되었습니다.");
    }

    if (error.message.includes("ServiceUnavailable")) {
      throw new Error("Chime 서비스가 현재 사용 불가합니다. 나중에 다시 시도해주세요.");
    }

    throw new Error("회의 삭제 및 회의실 사용 업데이트에 실패했습니다: " + error.message);
  }
};
