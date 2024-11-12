import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

const ddbClient = new DynamoDBClient({ region: process.env.REGION });

export const handler = async (event) => {
  try {
    const boardType = event.pathParameters.boardType;

    // boardType 검증
    const validBoardTypes = ["general", "questions", "team-recruit"];
    if (!validBoardTypes.includes(boardType)) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Invalid boardType" }),
      };
    }

    // DynamoDB 쿼리 설정
    const params = {
      TableName: process.env.DYNAMODB_TABLE,
      IndexName: "BoardIndex",
      KeyConditionExpression: "boardType = :boardType",
      ExpressionAttributeValues: {
        ":boardType": { S: boardType },
      },
      ScanIndexForward: false, // 최신순 정렬
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
      body: JSON.stringify(posts),
    };
  } catch (error) {
    console.error("Error listing posts:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: "Internal server error",
        error: error.message,
      }),
    };
  }
};
