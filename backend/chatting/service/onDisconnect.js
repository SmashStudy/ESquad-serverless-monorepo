const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

const client = new DynamoDBClient({ region: "us-east-1" });
const docClient = DynamoDBDocumentClient.from(client);

async function deleteItem(tableName, key) {
  const params = {
    TableName: tableName,
    Key: key,
  };

  try {
    await docClient.send(new DeleteCommand(params));
    console.log("Delete succeeded");
  } catch (err) {
    console.error(
      "Unable to delete item. Error:",
      JSON.stringify(err, null, 2)
    );
    throw err;
  }
}

exports.handler = async (event) => {
  console.log("Received event:", JSON.stringify(event, null, 2));

  const connectionId = event.requestContext.connectionId;

  try {
    await deleteItem( process.env.CHATTING_USERLIST_TABLE_NAME, {
      connection_id: connectionId,
    });


    return {
      statusCode: 200,
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
