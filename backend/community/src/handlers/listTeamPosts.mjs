import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { createResponse } from "../utils/responseHelper.mjs";

const ddbClient = new DynamoDBClient({ region: process.env.REGION });
const TABLE_NAME = process.env.DYNAMODB_TABLE;

export const handler = async (event) => {
  try {
    const { boardType } = event.pathParameters;

    if (!validBoardTypes.includes(boardType)) {
      return createResponse(400, { message: "Invalid boardType" });
    }

    const {
      limit = 10,
      lastEvaluatedKey,
      resolved,
      teamId
    } = parseQueryStringParameters(event.queryStringParameters);

    let params;

    if (resolved !== undefined) {
      params = {
        TableName: TABLE_NAME,
        IndexName: "board-resolved-create-index",
        KeyConditionExpression: "resolved = :resolved",
        FilterExpression:"teamId = :teamId",
        ExpressionAttributeValues: {
          ":resolved": { S: resolved },
          ":teamId": {S: teamId}
        },
        Limit: limit,
        ExclusiveStartKey: lastEvaluatedKey,
        ScanIndexForward: false,
      };
    
    }

    const data = await ddbClient.send(new QueryCommand(params));
    const posts = formatPosts(data.Items);

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
  recruitStatus: queryStringParameters.recruitStatus,
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
