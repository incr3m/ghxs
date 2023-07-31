const AWS = require('aws-sdk');
const { backfill } = require('./../common/back-filler');

const dynamodb = new AWS.DynamoDB();

const env = 'staging';
const appId = 'sbkb2bntdfa6xclojpgj5uhqje';
const tableName = 'GeneratedReportTable';

async function updater(current) {
  console.log(
    '>>backfill/generated-report-data::',
    'current.reportKey',
    current.reportKey,
  ); //TRACE
  const data = {
    id: current.reportKey,
    content: current.content,
    contentType: current.contentType,
  };

  if (!current.content) return;

  await dynamodb
    .putItem({
      TableName: `GeneratedReportContent-${appId}-${env}`,
      Item: AWS.DynamoDB.Converter.marshall(data),
    })
    .promise();

  return {
    UpdateExpression: 'REMOVE content',
  };
}

backfill(appId, tableName, updater, { fields: ['reportKey', 'content', 'contentType'] })
  .then(() => {
    console.log('done');
  })
  .catch(console.error);
