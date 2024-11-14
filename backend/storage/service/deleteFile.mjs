import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";

const dynamoDb = new DynamoDBClient({});
const TABLE_NAME = process.env.METADATA_TABLE;

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);

  let { storedFileName } = event.pathParameters;

  try {
    // Attempt to decode the file name
    storedFileName = decodeURIComponent(storedFileName);
  } catch (error) {
    // If already decoded, log and proceed
    console.log("File name did not require decoding:", storedFileName);
  }

  try {
    const deleteParams = {
      TableName: TABLE_NAME,
      Key: { id: `files/${storedFileName}` },
    };

    const command = new DeleteCommand(deleteParams);
    await dynamoDb.send(command);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE",
      },
      body: JSON.stringify({
        message: `Metadata for ${storedFileName} deleted successfully`,
      }),
    };
  } catch (error) {
    console.error("Error deleting metadata:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET,DELETE",
      },
      body: JSON.stringify({
        error: `Failed to delete metadata: ${error.message}`,
      }),
    };
  }
};
