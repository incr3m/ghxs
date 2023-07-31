process.env.AWS_REGION = process.env.AWS_REGION || 'ap-southeast-2';
process.env.APP_ID = process.env.APP_ID || '4uwanpq2azbgfaykydjxn6vaaq';
const AWS = require('aws-sdk');
// const Promise = require('bluebird');
const _ = require('lodash');
// const esQuery = require('./esQuery');
const appSync = new AWS.AppSync();
const dynamodb = new AWS.DynamoDB();
// const ENV = process.env.ENV || 'dev';

const BATCH = process.env.BATCH || 24;

async function backfill(appId, tableName, updater, { fields = [] } = {}) {
  console.log('>>backfill/index::', 'appid', appId); //TRACE

  if (!updater) throw Error('"updater" param is required');

  const tableDS = await appSync
    .getDataSource({
      apiId: appId,
      name: tableName,
    })
    .promise();
  const ddbTableName = _.get(tableDS, 'dataSource.dynamodbConfig.tableName');
  if (!ddbTableName) throw Error('Cant find table datasource');

  let count = 0,
    from,
    hits = [],
    idsToReindex = [];
  const queue = [];
  do {
    console.log('>> CURRENT OFFSET: ', from, ddbTableName, fields);
    idsToReindex = [];
    const res = await dynamodb
      .scan({
        TableName: ddbTableName,
        AttributesToGet: ['id', ...fields],
        Limit: BATCH,
        ExclusiveStartKey: from,
      })
      .promise();
    hits = _.get(res, 'Items', []);
    console.log('>>backfill/index::', 'hits.length, total', hits.length, count); //TRACE
    queue.push(...hits);
    const updaterFns = {};
    const ddIso = new Date().toISOString();

    do {
      const current = AWS.DynamoDB.Converter.unmarshall(queue.shift());
      // look ahead
      const currentId = _.get(current, 'id');
      const updaterFn = await Promise.resolve(updater(current));

      if (!updaterFn) continue;
      if (updaterFn === true) {
        updaterFns[currentId] = {
          ExpressionAttributeValues: {
            ':d': {
              S: ddIso,
            },
          },
          UpdateExpression: 'SET esReIndexed = :d',
        };
      } else {
        updaterFns[currentId] = {
          ...updaterFn,
        };
      }

      idsToReindex.push(currentId); // reindex from ddb
    } while (queue.length > 0);
    console.log('>>upgrade-index/index::', 'idsToDelete,idsToReindex', idsToReindex); //TRACE
    if (idsToReindex.length > 0) await ddbReindex(ddbTableName, idsToReindex, updaterFns);
    from = res.LastEvaluatedKey;
    console.log('>>upgrade-index/index::', 'from', from); //TRACE
    count += hits.length;
  } while (from);
  // } while (false);
  console.log('>>upgrade-index/index::', 'total processed', count); //TRACE
}

async function ddbReindex(ddbTableName, ids, updaterFns) {
  console.log('>>upgrade-index/index::', 'ids.length', ids.length); //TRACE
  await dynamodb
    .transactWriteItems({
      TransactItems: ids.map(id => {
        const updaterFn = updaterFns[id];
        return {
          Update: {
            TableName: ddbTableName,
            Key: {
              id: {
                S: id,
              },
            },
            ...updaterFn,
            // ExpressionAttributeValues: {
            //   ':d': {
            //     S: ddIso
            //   }
            // },
            // UpdateExpression: 'SET esReIndexed = :d'
          },
        };
      }),
    })
    .promise();
}

// eslint-disable-next-line no-undef
module.exports = {
  backfill,
};
