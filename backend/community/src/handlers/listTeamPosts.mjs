import {
  DynamoDBClient,
  QueryCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";
import { createResponse } from "../utils/responseHelper.mjs";

const ddbClient = new DynamoDBClient({ region: process.env.REGION });
const TABLE_NAME = process.env.DYNAMODB_TABLE;

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);

  try {
    const {
      limit = 10,
      lastEvaluatedKey,
      resolved,
      teamId,
    } = parseQueryStringParameters(event.queryStringParameters);

    if (!teamId) {
      throw new Error("teamId가 제공되지 않았습니다.");
    }

    let params;

    if (resolved === undefined) {
      // 전체 조회 (resolved 관계없이 teamId 기준)
      params = {
        TableName: TABLE_NAME,
        IndexName: "team-create-index", // teamId 기반 인덱스
        KeyConditionExpression: "teamId = :teamId",
        ExpressionAttributeValues: {
          ":teamId": { S: teamId },
        },
        Limit: limit,
        ExclusiveStartKey: lastEvaluatedKey,
        ScanIndexForward: false,
      };
    } else {
      // 미해결 또는 해결된 목록 조회 (resolved 필터 사용)
      params = {
        TableName: TABLE_NAME,
        IndexName: "board-resolved-create-index",
        KeyConditionExpression: "resolved = :resolved",
        FilterExpression: "teamId = :teamId",
        ExpressionAttributeValues: {
          ":resolved": { S: resolved },
          ":teamId": { S: teamId },
        },
        Limit: limit,
        ExclusiveStartKey: lastEvaluatedKey,
        ScanIndexForward: false,
      };
    }

    console.log("Query Params:", JSON.stringify(params, null, 2));
    const data = await ddbClient.send(new QueryCommand(params));
    console.log(`DynamoDB Response: ${JSON.stringify(data)}`);

    const posts = formatPosts(data.Items || []);
    console.log(`Formatted Posts: ${JSON.stringify(posts)}`);

    return createResponse(200, {
      items: posts,
      lastEvaluatedKey: data.LastEvaluatedKey,
    });
  } catch (error) {
    console.error("게시글 목록 조회 실패:", error);
    return createResponse(500, {
      message: "Internal server error",
      error: error.message,
    });
  }
};

const parseQueryStringParameters = (queryStringParameters = {}) => ({
  limit: queryStringParameters.limit
    ? parseInt(queryStringParameters.limit, 10)
    : 10,
  lastEvaluatedKey: queryStringParameters.lastEvaluatedKey
    ? JSON.parse(queryStringParameters.lastEvaluatedKey)
    : null,
  resolved: queryStringParameters.resolved,
  teamId: queryStringParameters.teamId,
});

// DynamoDB에서 반환된 데이터를 클라이언트에 맞게 포맷
const formatPosts = (items) => {
  return items.map((item) => {
    const post = {
      postId: item.PK.S.split("#")[1],
      boardType: item.boardType.S,
      teamId: item.teamId.S,
      title: item.title.S,
      content: item.content.S,
      createdAt: item.createdAt.S,
      updatedAt: item.updatedAt.S,
      viewCount: parseInt(item.viewCount.N, 10),
      likeCount: parseInt(item.likeCount.N, 10),
      tags: item.tags?.SS || [],
      commentCount: item.comments ? item.comments.L.length : 0, // 댓글 수 추가
    };

    // 작성자 정보 추가
    if (item.writer && item.writer.M) {
      post.writer = {
        name: item.writer.M.name?.S || "익명",
        nickname: item.writer.M.nickname?.S || "익명",
        email: item.writer.M.email?.S || "",
      };
    }

    if (item.boardType.S === "questions") {
      post.resolved = item.resolved?.S === "true";
    }

    return post;
  });
};
