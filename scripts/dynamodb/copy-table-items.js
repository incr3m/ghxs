const AWS = require('aws-sdk');
const _ = require('lodash');
const Promise = require('bluebird');

async function copyTableItems(source, target) {
  const profiles = {
    source: new AWS.SharedIniFileCredentials({ profile: source.profile }),
    target: new AWS.SharedIniFileCredentials({ profile: target.profile }),
  };

  const sourceDdb = new AWS.DynamoDB({
    region: source.region,
    credentials: profiles.source,
  });
  const targetDdb = new AWS.DynamoDB({
    region: target.region,
    credentials: profiles.target,
  });

  let nextToken,
    writeTotal = 0;
  do {
    const data = await sourceDdb
      .scan({
        TableName: source.tableName,
        ExclusiveStartKey: nextToken,
        Limit: 25,
      })
      .promise();
    const items = _.get(data, 'Items', []);
    if (items.length > 0) {
      // console.log('>>dynamodb/copy-table-items::', 'items', items); //TRACE
      console.log(
        `Writing to table ${source.tableName} : item count ${items.length},${writeTotal}`,
      );
      await Promise.all([
        targetDdb
          .batchWriteItem({
            RequestItems: {
              [target.tableName]: items.map(item => ({ PutRequest: { Item: item } })),
            },
          })
          .promise(),
        Promise.delay(200),
      ]);
    }
    nextToken = _.get(data, 'LastEvaluatedKey');
    writeTotal += items.length;
  } while (nextToken);

  console.log('>>dynamodb/copy-table-items::', 'writeTotal', writeTotal); //TRACE
}

module.exports = {
  copyTableItems,
};
