import { chimeSDKMeetings } from './chimeMeetingsClient.mjs';
import { getMeeting } from './getMeeting.mjs';
import { DynamoDBClient, DeleteItemCommand } from "@aws-sdk/client-dynamodb";

const dynamoDbClient = new DynamoDBClient({ region: "us-east-1" });
const meetingsTableName = process.env.MEETINGS_TABLE_NAME;

export const deleteMeeting = async (title, participant) => {
  try {
    // 회의 정보 조회
    const meetingInfo = await getMeeting(title);

    // 회의가 존재하지 않는 경우
    if (!meetingInfo) {
      throw new Error("Meeting not found");
    }

    // Chime SDK를 사용하여 회의 삭제 요청
    await chimeSDKMeetings.deleteMeeting({
      MeetingId: meetingInfo.Meeting.MeetingId,
    });

    console.log(`Meeting "${title}" deleted successfully.`);

    // participant가 "1"이면 DynamoDB 데이터 삭제
    if (participant === "1") {
      const deleteParams = {
        TableName: meetingsTableName,
        Key: {
          title: { S: title },
        },
      };

      const deleteCommand = new DeleteItemCommand(deleteParams);
      await dynamoDbClient.send(deleteCommand);

      console.log(`Meeting "${title}" removed from DynamoDB.`);
    }

    return { message: "Meeting deleted successfully" };
  } catch (error) {
    console.error("Error deleting meeting:", error);

    if (error.message === "Meeting not found") {
      throw new Error("Meeting not found");
    }

    if (error.message.includes("BadRequestException")) {
      throw new Error("Invalid request to delete meeting");
    }

    if (error.message.includes("ServiceUnavailable")) {
      throw new Error("Chime service unavailable, try again later");
    }

    throw new Error("Failed to delete meeting: " + error.message);
  }
};

