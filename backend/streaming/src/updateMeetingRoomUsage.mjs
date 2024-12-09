import { QueryCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { ddb } from './dynamoClient.mjs';

/**
 * 회의실 사용 기록 업데이트
 * @param {string} title - 업데이트할 회의 제목
 */
export const updateMeetingRoomUsage = async (title) => {
  const meetingsRoomUsageTableName = process.env.MEETING_ROOM_USAGE_TABLE_NAME;

  const queryParams = {
    TableName: meetingsRoomUsageTableName,
    KeyConditionExpression: "title = :title",
    ExpressionAttributeValues: {
      ":title": { S: title },
    },
    ScanIndexForward: false,
    Limit: 1,
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
        "#st": "status",
      },
    };

    const updateCommand = new UpdateItemCommand(updateParams);
    await ddb.send(updateCommand);

    console.log(`회의실 사용 기록이 "${title}"에 대해 업데이트되었습니다.`);
  } else {
    console.warn(`회의 "${title}"에 대한 사용 기록이 "${meetingsRoomUsageTableName}" 테이블에 존재하지 않습니다.`);
  }
};
