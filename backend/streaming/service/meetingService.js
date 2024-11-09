const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const oneDayFromNow = Math.floor(Date.now() / 1000) + 60 * 60 * 24;

const meetingsTableName = process.env.MEETINGS_TABLE_NAME;

module.exports.getMeeting = async (meetingTitle) => {
  const result = await dynamoDb
    .get({
      TableName: meetingsTableName,
      Key: { Title: meetingTitle },
    })
    .promise();

  return result.Item ? JSON.parse(result.Item.Data) : null;
};

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
