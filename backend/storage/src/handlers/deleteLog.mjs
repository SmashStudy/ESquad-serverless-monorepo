import {DeleteCommand} from '@aws-sdk/lib-dynamodb';
import {createResponse} from '../utils/responseHelper.mjs'
import {dynamoDb, LOG_TABLE} from "../utils/dynamoUtil.mjs";

export const handler = async (event) => {
  console.log(`event is ${JSON.stringify(event, null, 2)}`);

  let {logId} = event.pathParameters;

  try {
    logId = decodeURIComponent(logId);
  } catch (error) {
    console.log("File name did not require decoding:", logId);
  }

  console.log(`logId is ${logId}`);

  try {
    const deleteParams = {
      TableName: LOG_TABLE,
      Key: {logId: logId},
    };

    await dynamoDb.send(new DeleteCommand(deleteParams));

    return createResponse(200,
        {message: "successfully delete log"});
  } catch (error) {
    return createResponse(500,
        {error: `Failed to delete log: ${error.message}`});
  }
};
