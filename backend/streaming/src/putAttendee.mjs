import { TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb";
import { ddb } from './dynamoClient.mjs';

const attendeesTableName = process.env.ATTENDEES_TABLE_NAME;
const participantUsageTableName = process.env.PARTICIPANT_USAGE_TABLE_NAME;

/**
 * 참가자 정보를 DynamoDB에 저장합니다 (트랜잭션 사용).
 * @param {string} title - 회의 제목
 * @param {string} attendeeId - 참가자 ID
 * @param {string} attendeeName - 참가자 이름
 * @param {string} userEmail - 참가자 이메일
 * @param {string} teamId - 팀 ID
 * @returns {void}
 * @throws {Error} - DynamoDB 오류 발생 시
 */
export const putAttendee = async (title, attendeeId, attendeeName, userEmail, teamId) => {
  try {
    const now = new Date();
    const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
    const startAtISO = now.toISOString();
    const ttlSeconds = Math.floor(now.getTime() / 1000) + 60 * 60 * 3;

    const params = {
      TransactItems: [
        {
          Put: {
            TableName: attendeesTableName,
            Item: {
              attendeeId: { S: `${title}/${attendeeId}` },
              name: { S: attendeeName },
              ttl: { N: `${ttlSeconds}` },
            },
          },
        },
        {
          Put: {
            TableName: participantUsageTableName,
            Item: {
              userEmail: { S: userEmail },
              name: { S: attendeeName },
              start_At: { S: startAtISO },
              title: { S: title },
              teamId: { S: teamId },
            },
          },
        },
      ],
    };

    const command = new TransactWriteItemsCommand(params);
    await ddb.send(command);

    console.log(`참가자 "${attendeeName}"이(가) 회의 "${title}"에 성공적으로 추가되었으며, 사용 기록이 추적되었습니다.`);
  } catch (error) {
    console.error('참가자 저장 및 사용 기록 추적 중 오류 발생:', error);
    throw new Error(`참가자 저장 및 사용 기록 추적에 실패했습니다: ${error.message}`);
  }
};




// import { DynamoDBClient, TransactWriteItemsCommand } from "@aws-sdk/client-dynamodb";

// // DynamoDB 클라이언트 초기화
// const dynamoDbClient = new DynamoDBClient({ region: 'us-east-1' });

// // 환경 변수에서 테이블 이름 가져오기
// const attendeesTableName = process.env.ATTENDEES_TABLE_NAME;
// const participantUsageTableName = process.env.PARTICIPANT_USAGE_TABLE_NAME;

// /**
//  * 참가자 정보를 DynamoDB에 저장합니다 (트랜잭션 사용).
//  * @param {string} title - 회의 제목
//  * @param {string} attendeeId - 참가자 ID
//  * @param {string} attendeeName - 참가자 이름
//  * @returns {void}
//  * @throws {Error} - DynamoDB 오류 발생 시
//  */
// export const putAttendee = async (title, attendeeId, attendeeName, userEmail, teamId) => {
//   try {
//     // 현재 시간과 3시간 후 시간을 ISO 8601 형식으로 설정
//     const now = new Date();
//     const threeHoursFromNow = new Date(now.getTime() + 3 * 60 * 60 * 1000);
//     const startAtISO = now.toISOString();
//     const endAtISO = threeHoursFromNow.toISOString();
//     const ttlSeconds = Math.floor(now.getTime() / 1000) + 60 * 60 * 3;

//     // 트랜잭션 내에서 수행할 작업 정의
//     const params = {
//       TransactItems: [
//         {
//           Put: {
//             TableName: attendeesTableName,
//             Item: {
//               attendeeId: { S: `${title}/${attendeeId}` },
//               name: { S: attendeeName },
//               ttl: { N: `${ttlSeconds}` },
//             },
//           },
//         },
//         {
//           Put: {
//             TableName: participantUsageTableName,
//             Item: {
//               userEmail: { S: userEmail },
//               name: { S: attendeeName },
//               start_At: { S: startAtISO },
//               title: { S: title },
//               teamId: { S: teamId },
//             },
//           },
//         },
//       ],
//     };

//     // 트랜잭션 실행
//     const command = new TransactWriteItemsCommand(params);
//     await dynamoDbClient.send(command);

//     console.log(`Attendee ${attendeeName} added successfully to ${title} and participant usage tracked.`);

//   } catch (error) {
//     console.error('Error saving attendee and tracking usage:', error);
//     throw new Error(`Failed to save attendee and track usage: ${error.message}`);
//   }
// };
