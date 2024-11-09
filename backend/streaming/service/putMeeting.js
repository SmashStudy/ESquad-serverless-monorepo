const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const oneDayFromNow = Math.floor(Date.now() / 1000) + 60 * 60 * 24;
const meetingsTableName = process.env.MEETINGS_TABLE_NAME;

module.exports.putMeeting = async (title, meetingInfo) => {
  await dynamoDb
    .put({
      TableName: meetingsTableName,
      Item: {
        Title: title,
        Data: JSON.stringify(meetingInfo),
        TTL: oneDayFromNow,
      },
    })
    .promise();
};
