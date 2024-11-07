const AWS = require('aws-sdk');
const athena = new AWS.Athena();
const BUCKET_NAME = process.env.S3_BUCKET;
const DATABASE_NAME = process.env.GLUE_DATABASE;

module.exports.handler = async (event) => {
  const userId = event.queryStringParameters.userId;
  const params = {
    QueryString: `SELECT * FROM metadata WHERE "user-id" = ${userId}`,
    ResultConfiguration: {
      OutputLocation: `s3://${BUCKET_NAME}/athena-results/`
    },
    QueryExecutionContext: {
      Database: DATABASE_NAME
    }
  };

  const queryExecution = await athena.startQueryExecution(params).promise();
  const queryExecutionId = queryExecution.QueryExecutionId;

  let queryStatus;
  do {
    await new Promise(resolve => setTimeout(resolve, 1000));
    queryStatus = await athena.getQueryExecution({ QueryExecutionId: queryExecutionId }).promise();
  } while (queryStatus.QueryExecution.Status.State === 'RUNNING');

  if (queryStatus.QueryExecution.Status.State === 'SUCCEEDED') {
    const results = await athena.getQueryResults({ QueryExecutionId: queryExecutionId }).promise();
    const metadata = results.ResultSet.Rows[1].Data.reduce((acc, field, index) => {
      acc[results.ResultSet.Rows[0].Data[index].VarCharValue] = field.VarCharValue;
      return acc;
    }, {});

    return {
      statusCode: 200,
      body: JSON.stringify(metadata),
    };
  } else {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch metadata' })
    };
  }
};
