process.env.AWS_REGION = process.env.AWS_REGION || 'ap-southeast-2';
process.env.APP_ID = process.env.APP_ID || '4uwanpq2azbgfaykydjxn6vaaq';
const AWS = require('aws-sdk');
// const Promise = require('bluebird');
const _ = require('lodash');
const esQuery = require('./esQuery');
const appSync = new AWS.AppSync();
const dynamodb = new AWS.DynamoDB();
const TABLE_NAME = process.env.TABLE_NAME;

const BATCH = process.env.BATCH || 24;

async function main() {
  const appId = process.env.APP_ID;
  console.log('>>backfill/index::', 'appid', appId); //TRACE
  const tableName = `${TABLE_NAME}Table`;

  const tableDS = await appSync
    .getDataSource({
      apiId: appId,
      name: tableName,
    })
    .promise();
  const ddbTableName = _.get(tableDS, 'dataSource.dynamodbConfig.tableName');
  if (!ddbTableName) throw Error('Cant find table datasource');

  let from = 0,
    hits = [],
    idsToDelete = [],
    idsToReindex = [];
  const queue = [];
  do {
    console.log('>> CURRENT OFFSET: ', from);
    idsToDelete = [];
    idsToReindex = [];
    const res = await esQuery({
      index: TABLE_NAME.toLowerCase(),
      type: '_search',
      body: {
        from,
        size: BATCH,
        _source: 'id',
        sort: [
          {
            'id.keyword': {
              order: 'asc',
            },
          },
        ],
      },
    });
    hits = _.get(res, 'hits.hits', []);
    console.log('>>backfill/index::', 'hits.length', hits.length); //TRACE
    queue.push(...hits);
    do {
      const current = queue.shift();
      // look ahead
      const next = _.first(queue);
      const currentId = _.get(current, '_source.id');
      const nextId = _.get(next, '_source.id');
      if (currentId && currentId === nextId) {
        console.log('>>upgrade-index/index::', 'equal', currentId); //TRACE
        queue.shift();
        // duplicate, should delete the one with "id="
        idsToDelete.push(`id=${currentId}`);
      } else {
        // if not duplicate but the index is old, it should also be deleted and reindex
        if (current._id.startsWith('id=')) {
          console.log('>>upgrade-index/index::', 'current._id', current._id); //TRACE
          idsToDelete.push(current._id);
          idsToReindex.push(currentId); // reindex from ddb
        }
      }
    } while (queue.length > 1); // one left on queue should fetch the next iteration
    console.log(
      '>>upgrade-index/index::',
      'idsToDelete,idsToReindex',
      idsToDelete,
      idsToReindex,
    ); //TRACE
    if (idsToDelete.length > 0) await esBulkDelete(TABLE_NAME.toLowerCase(), idsToDelete);
    if (idsToReindex.length > 0) await ddbReindex(ddbTableName, idsToReindex);
    from += hits.length;
  } while (hits.length > 0);
}

async function esBulkDelete(index, ids) {
  let body = '';
  ids.forEach(id => {
    body += `{ "delete" : { "_index" : "${index}", "_type": "_doc", "_id" : "${id}" } }
`;
  });
  const res = await esQuery({
    method: 'POST',
    index: '_bulk',
    body: `${body}\n`,
  });
  if (res.errors) throw new Error(JSON.stringify(res));
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

main()
  .then(() => {
    console.log('done');
  })
  .catch(console.error);
