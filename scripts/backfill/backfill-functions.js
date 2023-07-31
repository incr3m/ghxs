const AWS = require('aws-sdk');
const _ = require('lodash');

const dynamodb = new AWS.DynamoDB({
  region: 'ap-southeast-2',
});

async function ddbReindex(ddbTableName, ids) {
  // console.log('>>upgrade-index/index::', 'ids.length', ids.length); //TRACE
  const ddIso = new Date().toISOString();
  await dynamodb
    .transactWriteItems({
      TransactItems: ids.map(id => {
        return {
          Update: {
            TableName: ddbTableName,
            Key: {
              id: {
                S: id,
              },
            },
            ExpressionAttributeValues: {
              ':d': {
                S: ddIso,
              },
            },
            UpdateExpression: 'SET esReIndexed = :d',
          },
        };
      }),
    })
    .promise();
}

async function backFillTable({ tableName: ddbTableName, batch = 24, maxCount = 2000 }) {
  let idsToReindex,
    count = 0,
    from,
    hits;

  do {
    console.log('>> CURRENT OFFSET: ', from, ddbTableName);
    idsToReindex = [];
    const res = await dynamodb
      .scan({
        TableName: ddbTableName,
        AttributesToGet: ['id'],
        Limit: batch,
        ExclusiveStartKey: from,
      })
      .promise();
    hits = _.get(res, 'Items', []);
    console.log('>>backfill/index::', 'hits.length, total', hits.length, count); //TRACE
    idsToReindex = hits.map(hit => hit.id.S);
    // console.log('>>upgrade-index/index::', 'idsToDelete,idsToReindex', idsToReindex); //TRACE
    if (idsToReindex.length > 0) await ddbReindex(ddbTableName, idsToReindex);
    from = res.LastEvaluatedKey;
    // console.log('>>upgrade-index/index::', 'from', from); //TRACE
    count += hits.length;
  } while (from && count < maxCount);
}

// eslint-disable-next-line no-undef
module.exports = { backFillTable };
