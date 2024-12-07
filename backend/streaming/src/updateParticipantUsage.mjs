import { DynamoDBClient, QueryCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";

const dynamoDbClient = new DynamoDBClient({ region: "us-east-1" });
const participantUsageTableName = process.env.PARTICIPANT_USAGE_TABLE_NAME;

/**
 * 특정 title에 대해 최신 start_At 항목을 가져오고, 그 중에서 name에 해당하는 사용자의 end_At를 업데이트
 * 
 * @param {string} title - 미팅 title
 * @param {string} name - 찾고자 하는 사용자 nickname
 */
export const updateParticipantUsage = async (title, name) => {
  // 1. TitleIndex로 title에 해당하는 최신 항목 조회
  // FilterExpression을 제거하고, 우선 최신 10개 정도 가져온 뒤 코드에서 name 필터링
  const queryParams = {
    TableName: participantUsageTableName,
    IndexName: "TitleIndex",   // GSI 이름 (title + start_At)
    KeyConditionExpression: "#title = :titleVal",
    ExpressionAttributeNames: {
      "#title": "title"
    },
    ExpressionAttributeValues: {
      ":titleVal": { S: title }
    },
    ScanIndexForward: false,  // start_At 내림차순
    Limit: 10
  };

  const queryResult = await dynamoDbClient.send(new QueryCommand(queryParams));
  
  if (!queryResult.Items || queryResult.Items.length === 0) {
    console.log("해당 title에 해당하는 레코드가 없습니다.");
    return;
  }

  // 2. 가져온 아이템들 중 name이 일치하는 항목을 찾는다.
  const latestItem = queryResult.Items.find(item => item.name && item.name.S === name);
  
  if (!latestItem) {
    console.log("해당 title 및 name에 해당하는 최신 레코드를 찾지 못했습니다.");
    return;
  }

  const userEmail = latestItem.userEmail.S;
  const startAt = latestItem.start_At.S;

  // 3. 해당 아이템에 end_At 업데이트
  const endAt = new Date().toISOString();
  const updateParams = {
    TableName: participantUsageTableName,
    Key: {
      userEmail: { S: userEmail },
      start_At: { S: startAt }
    },
    UpdateExpression: "SET end_At = :endVal",
    ExpressionAttributeValues: {
      ":endVal": { S: endAt }
    },
    ReturnValues: "ALL_NEW"
  };

  const updateResult = await dynamoDbClient.send(new UpdateItemCommand(updateParams));
  console.log("end_At 업데이트 완료:", updateResult);
};
