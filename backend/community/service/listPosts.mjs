import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({ region: process.env.REGION });
const TABLE_NAME = process.env.DYNAMODB_TABLE;

export const handler = async (event) => {
  try {
    const boardType = event.pathParameters.boardType;

    // 유효한 boardType 검사
    const validBoardTypes = ["general", "questions", "team-recruit"];
    if (!validBoardTypes.includes(boardType)) {
      return {
        statusCode: 400,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "Invalid boardType" }),
      };
    }

    // QueryString Parameters
    const limit = event.queryStringParameters?.limit
      ? parseInt(event.queryStringParameters.limit, 10)
      : 10;

    const lastEvaluatedKey = event.queryStringParameters?.lastEvaluatedKey
      ? JSON.parse(event.queryStringParameters.lastEvaluatedKey)
      : null;

    // 추가 필터 조건 (resolved 또는 recruitStatus)
    const resolvedFilter = event.queryStringParameters?.resolved;
    const recruitStatusFilter = event.queryStringParameters?.recruitStatus;

    // 기본 DynamoDB Query Parameters
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

    // 필터 조건에 따라 인덱스와 쿼리 변경
    if (boardType === "questions" && resolvedFilter !== undefined) {
      params.FilterExpression = "resolved = :resolved";
      params.ExpressionAttributeValues[":resolved"] = { S: resolvedFilter }; // 문자열로 변환
    } else if (
      boardType === "team-recruit" &&
      recruitStatusFilter !== undefined
    ) {
      params.FilterExpression = "recruitStatus = :recruitStatus";
      params.ExpressionAttributeValues[":recruitStatus"] = {
        S: recruitStatusFilter,
      }; // 문자열로 변환
    }

    console.log("DynamoDB Query Params:", params);

    // DynamoDB Query 실행
    const data = await ddbClient.send(new QueryCommand(params));

    // 응답 데이터 가공
    const posts = data.Items.map((item) => {
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
        post.resolved = item.resolved?.S === "true"; // 문자열을 Boolean으로 변환
      }

      if (item.boardType.S === "team-recruit") {
        post.recruitStatus = item.recruitStatus?.S === "true"; // 문자열을 Boolean으로 변환
      }

      return post;
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        items: posts,
        lastEvaluatedKey: data.LastEvaluatedKey,
      }),
    };
  } catch (error) {
    console.error("게시글 목록 조회 실패:", error);
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        message: "Internal server error",
        error: error.message,
      }),
    };
  }
};
