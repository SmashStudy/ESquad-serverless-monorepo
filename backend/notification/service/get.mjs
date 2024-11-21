import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";

const dynamodbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const NOTIFICATION_TABLE = process.env.NOTIFICATION_DYNAMODB_TABLE;
const NOTIFICATION_INDEX = process.env.NOTIFICATION_INDEX;

export const handler = async (event, context) => {
   console.log(`EVENT: \n${JSON.stringify(event, null, 2)}`);
   console.log(`CONTEXT: \n${JSON.stringify(context, null, 2)}`);

   let userId = event.queryStringParameters?.userId;
   userId = decodeURIComponent(userId);
   console.log(`userId: ${userId}`);
   if (!userId) {
      return {
        statusCode: 400,
        // headers: {
        //   "Content-Type": "text/plain; charset=utf-8",
        //   "Access-Control-Allow-Origin": "*",
        //   "Access-Control-Allow-Methods": "OPTIONS, GET",
        //   "Access-Control-Allow-Headers": "Content-Type, Authorization",
        // },
        body: JSON.stringify({ error: "Please provide userId." }),
      };
    }

   const params = {
      TableName: NOTIFICATION_TABLE,
      IndexName: NOTIFICATION_INDEX,
      KeyConditionExpression: "#userId = :userId AND isRead = :isRead",  // 파티션 키로 조건 지정
      ExpressionAttributeNames: {
         "#userId": "userId",           // Alias를 사용하여 매핑
      },
      ExpressionAttributeValues: {
         ":userId": { S: userId }, // 파라미터로 전달된 userId 값을 설정
         ":isRead": { N: "0" }, 
      },
   };

   try {
      const data = await dynamodbClient.send(new QueryCommand(params));
      const unreadMessages = data.Items.map((item) => ({
         id: item.id.S,
         userId: item.userId.S,
         message: item.message.S,
         sender: item.sender.S,
         isRead: item.isRead.N,
         createdAt: item.createdAt.S,
      }));
      console.log(`Unread Notifications: ${JSON.stringify(unreadMessages)}`);

      return {
         isBase64Encoded: true,
         statusCode: 200,
         // headers: {
         //    "Content-Type": "text/plain; charset=utf-8",
         //    "Access-Control-Allow-Origin": "*",
         //    "Access-Control-Allow-Methods": "OPTIONS, GET",
         //    "Access-Control-Allow-Headers": "Content-Type, Authorization",
         // },
         body: JSON.stringify(unreadMessages), // Convert the raw DynamoDB items to JSON
      };
   } catch (error) {
      console.error("Error fetching notifications:", error);
      return {
         isBase64Encoded: true,
         statusCode: 500,
         // headers: {
         //    "Content-Type": "text/plain; charset=utf-8",
         //    "Access-Control-Allow-Origin": "*",
         //    "Access-Control-Allow-Methods": "OPTIONS, GET",
         //    "Access-Control-Allow-Headers": "Content-Type, Authorization",
         // },
         body: JSON.stringify("Failed to fetch notifications"),
      };
   }
};