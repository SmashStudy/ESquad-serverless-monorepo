const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const attendeesTableName = process.env.ATTENDEES_TABLE_NAME;

module.exports.getAttendee = async (title, attendeeId) => {
  const result = await dynamoDb
    .get({
      TableName: attendeesTableName,
      Key: { AttendeeId: `${title}/${attendeeId}` },
    })
    .promise();

  return result.Item ? result.Item.Name : "Unknown";
};
