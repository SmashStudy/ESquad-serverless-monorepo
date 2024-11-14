import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({ region: process.env.REGION });
const TABLE_NAME = process.env.DYNAMODB_TABLE;

export const handler = async (event) => {
  try {
    const boardType = event.pathParameters.boardType;

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

    const limit = event.queryStringParameters?.limit
      ? parseInt(event.queryStringParameters.limit)
      : 10;

    const lastEvaluatedKey = event.queryStringParameters?.lastEvaluatedKey
      ? JSON.parse(event.queryStringParameters.lastEvaluatedKey)
      : null;

    const params = {
      TableName: TABLE_NAME,
      IndexName: "BoardIndex",
      KeyConditionExpression: "boardType = :boardType",
      ExpressionAttributeValues: {
        ":boardType": { S: boardType },
      },
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey, // Pagination 처리를 위한 파라미터
      ScanIndexForward: false,
    };

    console.log("DynamoDB Query Params:", params);

    const data = await ddbClient.send(new QueryCommand(params));

    const posts = data.Items.map((item) => ({
      postId: item.PK.S.split("#")[1],
      boardType: item.boardType.S,
      title: item.title.S,
      content: item.content.S,
      createdAt: item.createdAt.S,
      updatedAt: item.updatedAt.S,
      viewCount: parseInt(item.viewCount.N, 10),
      likeCount: parseInt(item.likeCount.N, 10),
      resolved: item.resolved?.BOOL || false,
    }));

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        items: posts,
        lastEvaluatedKey: data.LastEvaluatedKey, // Pagination 처리를 위한 lastEvaluatedKey 반환
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
