const AWS = require("aws-sdk");
const dynamoDb = new AWS.DynamoDB.DocumentClient();
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
