const AWS = require('aws-sdk');
const athena = new AWS.Athena();
const BUCKET_NAME = process.env.S3_BUCKET;
const DATABASE_NAME = process.env.GLUE_DATABASE;

module.exports.handler = async (event) => {
  // 쿼리 파라미터에서 targetId, targetType, userId 추출
  const { targetId, targetType, userId } = event.queryStringParameters || {};

  // 조건에 따라 Athena SQL 쿼리 작성
  let queryString = 'SELECT * FROM metadata WHERE';
  if (userId) {
    queryString += ` "user-id" = '${userId}'`;
  } else if (targetId && targetType) {
    queryString += ` "target-id" = '${targetId}' AND "target-type" = '${targetType}'`;
  } else {
    // 필수 매개변수가 없는 경우 예외 처리
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Please provide either targetId and targetType or userId.' }),
    };
  }

  // Athena 쿼리 실행 설정
  const params = {
    QueryString: queryString,
    ResultConfiguration: {
      OutputLocation: `s3://${BUCKET_NAME}/athena-results/`,
    },
    QueryExecutionContext: {
      Database: DATABASE_NAME,
    },
  };

  try {
    // Athena 쿼리 실행
    const queryExecution = await athena.startQueryExecution(params).promise();
    const queryExecutionId = queryExecution.QueryExecutionId;

    // 쿼리가 완료될 때까지 상태 확인
    let queryStatus;
    do {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      queryStatus = await athena.getQueryExecution({ QueryExecutionId: queryExecutionId }).promise();
    } while (queryStatus.QueryExecution.Status.State === 'RUNNING');

    // 쿼리가 성공적으로 완료된 경우
    if (queryStatus.QueryExecution.Status.State === 'SUCCEEDED') {
      const results = await athena.getQueryResults({ QueryExecutionId: queryExecutionId }).promise();

      // 결과 가공
      const metadataList = results.ResultSet.Rows.slice(1).map((row) => {
        const metadata = {};
        row.Data.forEach((field, index) => {
          const key = results.ResultSet.Rows[0].Data[index].VarCharValue;
          metadata[key] = field.VarCharValue;
        });
        return metadata;
      });

      return {
        statusCode: 200,
        body: JSON.stringify(metadataList),
      };
    } else {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to fetch metadata from Athena' }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
