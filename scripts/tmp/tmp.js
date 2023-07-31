const AWS = require('aws-sdk');
const Promise = require('bluebird');
const _ = require('lodash');
// const esQuery = require('./esQuery');
const dynamodb = new AWS.DynamoDB({
  region: 'ap-southeast-2',
});

async function main() {
  const toDelete = [];
  const res = await dynamodb
    .scan({
      TableName: 'replace',
      AttributesToGet: ['id'],
    })
    .promise();
  console.log('>>tmp/tmp::', 'res', res); //TRACE
  await Promise.map(
    res.Items,
    async item => {
      console.log('>>tmp/tmp::', 'item', item); //TRACE
      const itemId = item.id.S;
      if (!itemId) return;
      const res = await dynamodb
        .query({
          TableName: 'replace',
          IndexName: 'ByModelIdAction',
          KeyConditionExpression: 'modelId = :id AND #actn = :act',
          ExpressionAttributeNames: { '#actn': 'action' },
          ExpressionAttributeValues: { ':id': { S: item.id.S }, ':act': { S: 'REMOVE' } },
        })
        .promise();
      res.Items.forEach(i => {
        const results = AWS.DynamoDB.Converter.unmarshall(i);
        // console.log('>>tmp/tmp::', 'res', results); //TRACE
        if (results.oldValue.includes('"__typename":"Project"')) {
          console.log('>>tmp/tmp::', 'delete'); //TRACE
          toDelete.push(results.id);
        }
      });
    },
    { concurrency: 5 },
  );
  console.log('>>tmp/tmp::', 'toDelete', toDelete); //TRACE
}

main();
