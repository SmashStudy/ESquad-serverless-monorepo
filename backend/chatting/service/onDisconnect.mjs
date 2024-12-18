import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

// DynamoDB 클라이언트 초기화
const client = new DynamoDBClient({ region: process.env.CHATTING_REGION });
const docClient = DynamoDBDocumentClient.from(client);

async function deleteItem(tableName, key) {
  const params = {
    TableName: tableName,
    Key: key,
  };

  try {
    await docClient.send(new DeleteCommand(params));
  } catch (err) {
    console.error("Unable to delete item. Error:", JSON.stringify(err, null, 2));
    throw err;
  }
}

export const handler = async (event) => {

  const connectionId = event.requestContext.connectionId;

  try {
    await deleteItem(process.env.USERLIST_TABLE_NAME, {
      connection_id: connectionId,
    });

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': `${process.env.ALLOWED_ORIGIN}`,
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      body: JSON.stringify({ message: "Disconnected successfully" }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to process disconnect" }),
    };
  }
};
