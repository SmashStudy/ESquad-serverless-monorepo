import { TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb";
import { ddb } from './dynamoClient.mjs';

const meetingsTableName = process.env.MEETINGS_TABLE_NAME;
const MeetingRoomUsageTrackingTableName = process.env.MEETING_ROOM_USAGE_TABLE_NAME;

/**
 * 회의 정보를 DynamoDB에 저장합니다.
 * @param {string} title - 회의 제목
 * @param {string} attendeeName - 참가자 이름
 * @param {Object} meetingInfo - 저장할 회의 정보 객체
 * @param {string} userEmail - 사용자 이메일
 * @param {string} teamId - 팀 ID
 * @param {string} status - 회의 상태 ("true"/"false")
 * @returns {void}
 * @throws {Error} - DynamoDB 오류 발생 시
 */
export const putMeeting = async (title, attendeeName, meetingInfo, userEmail, teamId, status) => {
  const now = new Date();
  const ttlSeconds = Math.floor(now.getTime() / 1000) + (3 * 60 * 60); // 현재 시간 기준 3시간 후 TTL

  try {
    const params = {
      TransactItems: [
        {
          Put: {
            TableName: meetingsTableName,
            Item: {
              title: { S: title },
              data: { S: JSON.stringify(meetingInfo) },
              ttl: { N: `${ttlSeconds}` },
            },
          },
        },
        {
          Put: {
            TableName: MeetingRoomUsageTrackingTableName,
            Item: {
              teamId: { S: teamId },
              title: { S: title },
              name: { S: attendeeName },
              userEmail: { S: userEmail },
              start_At: { S: now.toISOString() },
              status: { S: status },
            },
          },
        },
      ],
    };

    const command = new TransactWriteItemsCommand(params);
    await ddb.send(command);

    console.log(`회의 "${title}"과(와) 사용 기록이 성공적으로 저장되었습니다.`);
  } catch (error) {
    console.error("회의 정보 저장 및 사용 기록 추적 중 오류 발생:", error);
    throw new Error(`회의 정보 저장 및 사용 기록 추적에 실패했습니다: ${error.message}`);
  }
};



// import { DynamoDBClient, TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb";

// const dynamoDbClient = new DynamoDBClient({ region: 'us-east-1' });

// const meetingsTableName = process.env.MEETINGS_TABLE_NAME;
// const MeetingRoomUsageTrackingTableName = process.env.MEETING_ROOM_USAGE_TABLE_NAME;

// /**
//  * 회의 정보를 DynamoDB에 저장합니다.
//  * @param {string} title - 회의 제목
//  * @param {Object} meetingInfo - 저장할 회의 정보 객체
//  * @param {string} status - 회의 상태 ("true"/"false")
//  * @returns {void}
//  * @throws {Error} - DynamoDB 오류 발생 시
//  */
// export const putMeeting = async (title, attendeeName, meetingInfo, userEmail, teamId, status ) => {
 
//   const now = new Date();
//   const ttlSeconds = Math.floor(now.getTime() / 1000) + 3 * 60 * 60;

//   try {
//     const params = {
//       TransactItems: [
//         {
//           Put: {
//             TableName: meetingsTableName,
//             Item: {
//               title: { S: title },
//               data: { S: JSON.stringify(meetingInfo) },
//               ttl: { N: `${ttlSeconds}` },
//             },
//           },
//         },
//         {
//           Put: {
//             TableName: MeetingRoomUsageTrackingTableName,
//             Item: {
//               teamId: {S: teamId },
//               title: { S: title },
//               name: { S: attendeeName },
//               userEmail: { S: userEmail },
//               start_At: { S: now.toISOString() },
//               status: { S: status },
//             },
//           },
//         },
//       ],
//     };

//     const command = new TransactWriteItemsCommand(params);
//     await dynamoDbClient.send(command);

//     console.log(`Meeting "${title}" and usage tracking saved successfully.`);
//   } catch (error) {
//     console.error("Error saving meeting and usage tracking:", error);
//     throw new Error(`Failed to save meeting and usage tracking: ${error.message}`);
//   }
// };
