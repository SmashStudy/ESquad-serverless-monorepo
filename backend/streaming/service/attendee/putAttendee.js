const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();

const attendeesTableName = process.env.ATTENDEES_TABLE_NAME;

module.exports.putAttendee = async (title, attendeeId, attendeeName) => {
  await dynamoDb
    .put({
      TableName: attendeesTableName,
      Item: {
        AttendeeId: `${title}/${attendeeId}`,
        Name: attendeeName,
        TTL: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
      },
    })
    .promise();
};
