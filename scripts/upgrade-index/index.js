process.env.AWS_REGION = process.env.AWS_REGION || 'ap-southeast-2';
process.env.APP_ID = process.env.APP_ID || '4uwanpq2azbgfaykydjxn6vaaq';
const AWS = require('aws-sdk');
// const Promise = require('bluebird');
const _ = require('lodash');
const esQuery = require('./esQuery');
const appSync = new AWS.AppSync();
const dynamodb = new AWS.DynamoDB();
const ENV = process.env.ENV || 'dev';
const TABLE_NAME = process.env.TABLE_NAME;

const BATCH = process.env.BATCH || 24;

async function main() {
  const appId = process.env.APP_ID;
  console.log('>>backfill/index::', 'appid', appId); //TRACE
  const tableName = `${TABLE_NAME}Table`;

  const tableDS = await appSync
    .getDataSource({
      apiId: appId,
      name: tableName
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
    console.log('>> CURRENT OFFSET: ', from, ddbTableName);
    idsToReindex = [];
    const res = await dynamodb
      .scan({
        TableName: ddbTableName,
        AttributesToGet: ['id'],
        Limit: BATCH,
        ExclusiveStartKey: from
      })
      .promise();
    hits = _.get(res, 'Items', []);
    console.log('>>backfill/index::', 'hits.length, total', hits.length, count); //TRACE
    queue.push(...hits);
    do {
      const current = AWS.DynamoDB.Converter.unmarshall(queue.shift());
      // look ahead
      const currentId = _.get(current, 'id');
      idsToReindex.push(currentId); // reindex from ddb
    } while (queue.length > 1); // one left on queue should fetch the next iteration
    console.log('>>upgrade-index/index::', 'idsToDelete,idsToReindex', idsToReindex); //TRACE
    if (idsToReindex.length > 0) await ddbReindex(ddbTableName, idsToReindex);
    from = res.LastEvaluatedKey;
    console.log('>>upgrade-index/index::', 'from', from); //TRACE
    count += hits.length;
  } while (from);
  console.log('>>upgrade-index/index::', 'total processed', count); //TRACE
}

async function ddbReindex(ddbTableName, ids) {
  console.log('>>upgrade-index/index::', 'ids.length', ids.length); //TRACE
  const ddIso = new Date().toISOString();
  await dynamodb
    .transactWriteItems({
      TransactItems: ids.map(id => {
        return {
          Update: {
            TableName: ddbTableName,
            Key: {
              id: {
                S: id
              }
            },
            ExpressionAttributeValues: {
              ':d': {
                S: ddIso
              }
            },
            UpdateExpression: 'SET esReIndexed = :d'
          }
        };
      })
    })
    .promise();
}

main()
  .then(() => {
    console.log('done');
  })
  .catch(console.error);
