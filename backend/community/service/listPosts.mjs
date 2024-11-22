import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({ region: process.env.REGION });
const TABLE_NAME = process.env.DYNAMODB_TABLE;

export const handler = async (event) => {
  try {
    const { boardType } = event.pathParameters;
    const validBoardTypes = ["general", "questions", "team-recruit"];

    if (!validBoardTypes.includes(boardType)) {
      return generateResponse(400, { message: "Invalid boardType" });
    }

    const {
      limit = 10,
      lastEvaluatedKey,
      resolved,
      recruitStatus,
    } = parseQueryStringParameters(event.queryStringParameters);

    let params = createQueryParams(
      boardType,
      limit,
      lastEvaluatedKey,
      resolved,
      recruitStatus
    );

    const data = await ddbClient.send(new QueryCommand(params));
    const posts = formatPosts(data.Items);

    return generateResponse(200, {
      items: posts,
      lastEvaluatedKey: data.LastEvaluatedKey,
    });
  } catch (error) {
    console.error("게시글 목록 조회 실패:", error);
    return generateResponse(500, {
      message: "Internal server error",
      error: error.message,
    });
  }
};

const generateResponse = (statusCode, body) => ({
  statusCode,
  headers: {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  },
  body: JSON.stringify(body),
});

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

const createQueryParams = (
  boardType,
  limit,
  lastEvaluatedKey,
  resolvedFilter,
  recruitStatusFilter
) => {
  let params = {
    TableName: TABLE_NAME,
    IndexName: "BoardIndex",
    KeyConditionExpression: "boardType = :boardType",
    ExpressionAttributeValues: {
      ":boardType": { S: boardType },
    },
    Limit: limit,
    ExclusiveStartKey: lastEvaluatedKey,
    ScanIndexForward: false,
  };

  if (boardType === "questions" && resolvedFilter !== undefined) {
    params.FilterExpression = "resolved = :resolved";
    params.ExpressionAttributeValues[":resolved"] = { S: resolvedFilter };
  } else if (
    boardType === "team-recruit" &&
    recruitStatusFilter !== undefined
  ) {
    params.FilterExpression = "recruitStatus = :recruitStatus";
    params.ExpressionAttributeValues[":recruitStatus"] = {
      S: recruitStatusFilter,
    };
  }

  return params;
};

const formatPosts = (items) => {
  return items.map((item) => {
    const post = {
      postId: item.PK.S.split("#")[1],
      boardType: item.boardType.S,
      title: item.title.S,
      content: item.content.S,
      createdAt: item.createdAt.S,
      updatedAt: item.updatedAt.S,
      viewCount: parseInt(item.viewCount.N, 10),
      likeCount: parseInt(item.likeCount.N, 10),
      tags: item.tags?.SS || [],
    };

    if (item.boardType.S === "questions") {
      post.resolved = item.resolved?.S === "true";
    }

    if (item.boardType.S === "team-recruit") {
      post.recruitStatus = item.recruitStatus?.S === "true";
    }

    return post;
  });
};
