import {
  BatchWriteItemCommand,
  DynamoDBClient,
  QueryCommand,
} from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import {createResponse} from "../util/responseHelper.mjs";

const dynamoClient = new DynamoDBClient({ region: process.env.AWS_REGION });

const TEAM_TABLE = process.env.TEAM_TABLE;
const NOTIFICATION_TABLE = process.env.NOTIFICATION_TABLE;

const MAX_BATCH_SIZE = 25;

// 사용자들에게 알림을 저장
const saveNotifications = async (users, message, studyId) => {
  try {
    // 사용자 목록을 25개씩 나누어 처리합니다 (DynamoDB BatchWriteItem의 최대 크기)
    for (let i = 0; i < users.length; i += MAX_BATCH_SIZE) {
      const chunk = users.slice(i, i + MAX_BATCH_SIZE);
      const writeRequests = chunk.map((user) => ({
        PutRequest: {
          Item: {
            id: { S: `${uuidv4()}` },
            userId: { S: user },
            message: { S: message },
            sender: { S: studyId },
            isRead: { N: "0" }, // Corrected the format to string "0"
            isSave: { N: "0" },
            createdAt: { S: new Date().toISOString() },
          },
        },
      }));

      const params = {
        RequestItems: {
          [NOTIFICATION_TABLE]: writeRequests,
        },
      };

      // BatchWriteItemCommand를 보내고, 처리되지 않은 항목에 대해 재시도
      let unprocessedItems = params.RequestItems;
      while (Object.keys(unprocessedItems).length > 0) {
        const command = new BatchWriteItemCommand({
          RequestItems: unprocessedItems,
        });
        const response = await dynamoClient.send(command);

        if (
          response.UnprocessedItems &&
          Object.keys(response.UnprocessedItems).length > 0
        ) {
          console.warn(
            "Retrying unprocessed items:",
            response.UnprocessedItems
          );
          unprocessedItems = response.UnprocessedItems;
        } else {
          unprocessedItems = {};
        }
      }
      console.log("Chunk of notifications written successfully.");
    }
  } catch (error) {
    console.error("Error saving notifications:", error);
    throw new Error("Error saving notifications");
  }
};

export const handler = async (event) => {
  try {
    console.log("Received DynamoDB Stream Event:", JSON.stringify(event));

    for (const record of event.Records) {
      if (!["INSERT"].includes(record.eventName)) {
        continue; // INSERT 및 REMOVE 이벤트만 처리
      }

      const newImage = record.dynamodb.NewImage;
      if (!newImage || newImage.targetType.S !== "STUDY_PAGE") {
        continue; // targetType이 STUDY_PAGE가 아니면 무시
      }

      try {
        // 삽입된 항목에서 사용자 ID를 추출
        const userEmail = newImage.userEmail.S;
        const targetId = newImage.targetId.S;
        const fileName = newImage.originalFileName.S;

        // 1. StudyPage 정보 가져오기 ( 유저ID 및 studyPageName)
        const teamQueryCommand = new QueryCommand({
          TableName: TEAM_TABLE,
          KeyConditionExpression: "PK = :pk",
          ExpressionAttributeValues: {
            ":pk": { S: targetId },
          },
        });

        const teamResponse = await dynamoClient.send(teamQueryCommand);
        console.log(`TeamTable Items: ${JSON.stringify(teamResponse.Items)}`);

        // 2. 스터디페이지명과 유저정보 분리
        const studyName = teamResponse.Items.find(
          (item) => item.itemType.S === "Study"
        )?.studyName.S;
        const users = teamResponse.Items.filter(
          (item) =>
            item.itemType?.S === "StudyUser" &&
            item.inviteState?.S === "Active"
        )
          .map((item) => item.SK?.S)
          .filter(Boolean);

        if (!studyName || users.length === 0) {
          console.warn("Study name or users not found, skipping notification.");
          continue;
        }

        // 3. 알림 메시지 생성
        const message = `${userEmail} 가 파일 ${fileName} 을 ${studyName} 스터디에 공유했습니다.`;

        // 3. 알림 저장
        await saveNotifications(users, message, targetId);
        console.log("Notifications written successfully.");

        return createResponse(200, {
          message: "Notification Saved!",
        });
      } catch (error) {
        return createResponse(500, {
          error: "Error while publishing notification on file uploaded: " + error,
        });
      }
    }
  } catch (error) {
    console.error("Error processing DynamoDB Stream Event:", error);
    return createResponse(500, {
      error: "Error processing DynamoDB Stream Event: " + error,
    });
  }
};
