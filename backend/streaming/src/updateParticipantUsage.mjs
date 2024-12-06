import { chimeSDKMeetings } from './chimeMeetingsClient.mjs';
import { getMeeting } from './getMeeting.mjs';
import { DynamoDBClient, DeleteItemCommand, QueryCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const dynamoDbClient = new DynamoDBClient({ region: "us-east-1" });

const participantUsageTableName = process.env.PARTICIPANT_USAGE_TABLE_NAME;

/**
 * 참여자가 회의실 나갈 때에 사용 추적을 업데이트합니다.
 * 
 * @param {string} title -  회의 제목
 * @param {string} userEmail - 유저 이메일
 */
export const updateParticipantUsage = async (title, userEmail) => {

};

